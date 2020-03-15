const jwt = require('jsonwebtoken');
const { extractUsernamesFromImage } = require('./image');

const JWT_KEY = process.env.JWT_KEY || require('../config.js').JWT_KEY;

const JWT_ISSUER = process.env.JWT_ISSUER || require('../config.js').JWT_ISSUER;

const JWT_AUDIENCE = process.env.JWT_AUDIENCE || require('../config.js').JWT_AUDIENCE;

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const CODE_LENGTH = 6;

const AUTH_FORMAT = /^Bearer .*$/;

const INTEGER_REGEX = /^\d+$/;

const isSessionCodeFormatValid = code => code.length === CODE_LENGTH && code.replace(new RegExp(`[^${CODE_CHARS}]`, 'g'), '').length === code.length;

const PLATFORMS = ['ps', 'steam', 'xbox'];

const GAME_MODES = [ 
    {
        title: 'Ranked Duel 1v1',
        label: 'Solo Duel',
        players: 1
    },
    {
        title: 'Ranked Doubles 2v2',
        label: 'Doubles',
        players: 2
    },
    {
        title: 'Ranked Standard 3v3',
        label: 'Standard',
        players: 3
    },
    {
        title: 'Ranked Solo Standard 3v3',
        label: 'Solo Standard',
        players: 3
    },
    {
        title: 'Hoops',
        label: 'Hoops',
        players: 2
    },
    {
        title: 'Rumble',
        label: 'Rumble',
        players: 3
    },
    {
        title: 'Dropshot',
        label: 'Dropshot',
        players: 3
    },
];

const generateRandomCode = length => {
    var code = '';
    for(var i = 0; i < length; i++) {
        code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
    return code;
}

const addSession = (req, res, database) => {
    database.select('code').from('sessions')
    .then(codes => {
        codes = codes.map(code => code.code);
        var newCode = '';
        do {
            newCode = generateRandomCode(CODE_LENGTH);
        } while (codes.includes(newCode));
        
        database('sessions').insert({
            code: newCode
        })
        .returning('*')
        .then(session => {
            session = session[0];
            jwt.sign({ id: session.id, code: session.code, startTime: session.start_time }, JWT_KEY, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE }, (err, token) => {
                if(err) {
                    res.status(500).send('Error creating token');
                }
                res.json({
                    token,
                    code: session.code,
                    startTime: session.start_time
                });
            })
        })
        .catch(err => res.status(500).send(err));
    })
    .catch(err => res.status(500).send(err));
}

const editUsername = (req, res, database) => {
    jwt.verify(req.token, JWT_KEY, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE }, (err, data) => {
        if(err) {
            res.sendStatus(403);
            console.log(err);
        } else {
            const sessionId = data.id;
            
            if(!(req.body.name && (!req.body.platform || PLATFORMS.includes(req.body.platform)))) {
                res.status(400).send('Invalid name or platform');
            } else if (!INTEGER_REGEX.test(req.params.match)) {
                res.status(400).send('Invalid match id');
            } else if (req.params.team !== '0' && req.params.team !== '1') {
                res.status(400).send('Invalid team index');
            } else if (req.body.name) {
                database.select('code')
                        .from('sessions').innerJoin('matches', 'sessions.id', 'matches.session_id').innerJoin('players', 'players.match_id', 'matches.id')
                        .where('sessions.id', '=', sessionId).andWhere('matches.id', '=', req.params.match).andWhere('players.team', '=', req.params.team).andWhere('players.id', '=', req.params.player)
                        .first()
                        .then(code => {
                            code = code.code;
                            if (code === req.params.code) {
                                database('players')
                                    .returning('*')
                                    .where('id', '=', req.params.player)
                                    .update({ name: req.body.name, platform: req.body.platform || undefined })
                                    .then(player => res.json(player[0]))
                                    .catch(err => {
                                        console.log(err);
                                        res.sendStatus(500);
                                    });
                            } else {
                                res.sendStatus(403);
                                console.log('Wrong code');
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            res.sendStatus(500);
                        });
            }
        }
    });
}

const addMatch = async (req, res, database) => {
    jwt.verify(req.token, JWT_KEY, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE }, async (err, data) => {
        if(err) {
            res.sendStatus(403);
        } else {
            const sessionId = data.id;

            if (!(req.body.mode && GAME_MODES.map(mode => mode.title).includes(req.body.mode))) {
                res.status(400).send('Invalid mode');            
            } else {
                var players;
                if (req.body.players) {
                    if(!(req.body.players && Array.isArray(req.body.players) && req.body.players.length === 2 && Array.isArray(req.body.players[0]) && Array.isArray(req.body.players[1]) && req.body.players[0].length === req.body.players[1].length && GAME_MODES.filter(mode => mode.title === req.body.mode)[0].players === req.body.players[0].length && req.body.players[0].length <= 3 && req.body.players[0].length > 0 && req.body.players[0].concat(req.body.players[1]).every(player => player.name && (Object.entries(player).length === 1 || (player.platform && PLATFORMS.includes(player.platform)))))) {
                        res.status(400).send('Invalid players list');
                    } else {
                        players = req.body.players;
                    }
                } else if (req.body.image) {
                    const teamSize = GAME_MODES.filter(mode => mode.title === req.body.mode)[0].players;
                    players = (await extractUsernamesFromImage(req.body.image)).players.map(teamPlayers => teamPlayers.slice(0,teamSize).map(player => ({name: player})));
                } else {
                    res.status(400).send('Requires player list or scoreboard image');
                }
                if (players !== undefined) {
                    database.select('code').from('sessions').where('id', '=', sessionId).first()
                        .then(code => {
                            code = code.code;
                            if (code === req.params.code) {
                                database.transaction(trx => {
                                    return trx.insert({
                                        session_id: sessionId,
                                        mode: req.body.mode
                                    }, 'id')
                                    .into('matches')
                                    .then(matchId => {
                                        matchId = matchId[0];
                                        players = players.map((teamPlayers, index) => teamPlayers.map(player => ({...player, match_id: matchId, team: index})));
                                        return trx.insert(players[0].concat(players[1])).into('players').returning('*');
                                    });
                                })
                                .then(inserts => {
                                    res.json({
                                        players: inserts.reduce((acc, player) => { acc[player.team].push({ name: player.name, platform: player.platform, id: player.id }); return acc; }, [[], []]),
                                        mode: req.body.mode,
                                        id: inserts[0].match_id
                                    });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.sendStatus(500);
                                });
                            } else {
                                res.sendStatus(403);
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            res.sendStatus(500);
                        })
                }
            }
        }
    });
}

const getMatches = (req, res, code, database) => {
    if(isSessionCodeFormatValid(code)) {
        database.select('sessions.code', 'matches.id', 'players.name', 'players.platform', 'players.team', 'matches.start_time', 'matches.mode')
        .from('sessions', 'matches', 'players')
        .leftOuterJoin('matches', 'sessions.id', 'matches.session_id')
        .leftOuterJoin('players', 'matches.id', 'players.match_id')
        .where('sessions.code', '=', code)
        .then(data => {
            if (data.length === 0) { // If no records returned, code does not exist
                res.status(400).send('Session does not exist');
            } else if (data.length === 1) { // If one record returned, code exists but no matches played yet
                res.json([]);
            } else { // If more than one record exists, code exists and matches played
                const matches = {};
                data.forEach(player => {
                    const newPlayer = {
                        name: player.name
                    };
                    if(player.platform) {
                        newPlayer.platform = player.platform;
                    }
                    if(!matches[player.id]) {
                        matches[player.id] = {
                            players: [[], []],
                            startTime: player.start_time,
                            mode: player.mode
                        };
                    }
                    matches[player.id].players[player.team].push(newPlayer);
                });
                res.json(Object.values(matches).sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
            }
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    } else {
        res.status(400).send('Session does not exist');
    }
}

const checkTokenExists = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(authHeader) {
        if(AUTH_FORMAT.test(authHeader)) {
            const token = authHeader.split(' ')[1];
            req.token = token;
            next();
        } else {
            res.status(401).send('Incorrect auth header format');
        }
    } else {
        res.status(401).send('No auth token');
    }
}

module.exports = {
    addSession,
    addMatch,
    getMatches,
    editUsername,
    checkTokenExists
}