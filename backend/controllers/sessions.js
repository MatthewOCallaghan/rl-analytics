const jwt = require('jsonwebtoken');
const { extractUsernamesFromImage } = require('./image');
const admin = require('firebase-admin');

const JWT_KEY = process.env.JWT_KEY || require('../config.js').JWT_KEY;

const JWT_ISSUER = process.env.JWT_ISSUER || require('../config.js').JWT_ISSUER;

const JWT_AUDIENCE = process.env.JWT_AUDIENCE || require('../config.js').JWT_AUDIENCE;

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const CODE_LENGTH = 6;

const AUTH_FORMAT = /^Bearer .*$/;

const INTEGER_REGEX = /^\d+$/;

const RANK_REGEX = /^((Unranked|Bronze|Silver|Gold|Platinum|Diamond|Champion) I{1,3}|Grand champion)$/;

const DIVISION_REGEX = /^I(I{1,2}|V)?$/;

const isSessionCodeFormatValid = code => code.length === CODE_LENGTH && code.replace(new RegExp(`[^${CODE_CHARS}]`, 'g'), '').length === code.length;

const PLATFORMS = ['ps', 'steam', 'xbox'];

const MATCH_STATUSES = ['playing', 'finished', 'completing', 'error'];

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

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://rl-analytics-auth.firebaseio.com"
});

const generateRandomCode = length => {
    var code = '';
    for(var i = 0; i < length; i++) {
        code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
    return code;
}

const addSession = async (req, res, database) => {
    var userId = null;
    if (req.token) {
        try {
            const user = await admin.auth().verifyIdToken(req.token);
            userId = user.uid;
        } catch (error) {
            res.sendStatus(403);
            console.log(error);
            return;
        }          
    }

    try {
        // Generate code
        var codes = await database.select('code').from('sessions');
        codes = codes.map(code => code.code);
        var newCode = '';
        do {
            newCode = generateRandomCode(CODE_LENGTH);
        } while (codes.includes(newCode));

        // Transaction
        await database.transaction(async trx => {
            var session = await trx.insert({
                                            code: newCode
                                        }, '*')
                                        .into('sessions');
            session = session[0];
            if(userId) {
                await trx('session_owners').insert({
                    session_id: session.id,
                    user_id: userId
                });
            }

            // Token
            const token = await new Promise((resolve, reject) => {
                jwt.sign({ id: session.id, code: session.code, startTime: session.start_time }, JWT_KEY, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE }, (err, token) => {
                    if(err) {
                        reject(new Error('Error creating token'));
                    }
                    resolve({
                        token,
                        code: session.code,
                        startTime: session.start_time
                    });                    
                });
            })
            
            res.json(token);
        });

    } catch(error) {
        console.log(error);
        res.status(500).send(error);
    }
}

const editUsername = (req, res, database) => {
    const sessionId = req.tokenData.id;
            
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

const addMatch = async (req, res, database) => {
    const sessionId = req.tokenData.id;

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
                });
        }
    }
}

const finishMatch = (req, res, sessionCode, matchId, database) => {
    const sessionId = req.tokenData.id;

    database.select('code')
            .from('sessions').innerJoin('matches', 'matches.session_id', 'sessions.id')
            .where('sessions.id', '=', sessionId).andWhere('matches.id', '=', matchId)
            .first()
        .then(code => {
            code = code.code;

            if (code === sessionCode) {
                database('matches').where({ id: matchId }).update({ status: 'completing' }, ['id', 'status'])
                .then(update => {
                    res.json(update);
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
        });
        
}

const submitResult = (req, res, sessionCode, matchId, database) => {
    const sessionId = req.tokenData.id;

    const status = req.body.status;
    var result = req.body.result;

    if(!status || !MATCH_STATUSES.includes(status)) {
        res.status(400).send('Invalid status');
    } else if(status === 'finished' && !(result && Array.isArray(result) && result.length === 2 && Array.isArray(result[0]) && Array.isArray(result[1]) && result[0].concat(result[1]).length > 0 && result[0].concat(result[1]).filter(update => [update.id, update.wins].filter(value => value === undefined).length > 0 || (update.rank !== undefined && !RANK_REGEX.test(update.rank)) || (update.division !== undefined && !DIVISION_REGEX.test(update.division)) || (update.mmrChange !== undefined && !Number.isInteger(update.mmrChange))).length === 0 && result[0].map(playerUpdate => playerUpdate.wins).every((r,i,arr) => r === arr[0]) && result[1].map(playerUpdate => playerUpdate.wins).every((r,i,arr) => r === arr[0]))) {
        res.status(400).send('Incorrect result format');
    } else {
        database.select('code')
                .from('sessions').innerJoin('matches', 'matches.session_id', 'sessions.id')
                .where('sessions.id', '=', sessionId).andWhere('matches.id', '=', matchId)
                .first()
            .then(code => {
                code = code.code;

                if (code === sessionCode) {
                    
                    if (status === 'error') {
                        database('matches').where({ id: matchId }).update({ status: 'error' }, ['id', 'status'])
                            .then(update => {
                                res.json(update);
                            })
                            .catch(err => {
                                console.log(err);
                                res.sendStatus(500);
                            });
                    } else if (status === 'finished') {
                        result = result.map((teamResult, index) => teamResult.map(playerResult => ({ ...playerResult, team: index })));
                        result = result[0].concat(result[1]);

                        const mvps = result.filter(playerUpdate => playerUpdate.mvps).map(playerUpdate => playerUpdate.id);

                        database.transaction(trx => {
                            database('matches').transacting(trx).where({ id: matchId }).update({ status: 'finished', mvp: mvps.length === 1 ? mvps[0] : undefined, winner: result[0].wins === 0 ? 1 - result[0].team : result[0].team }, ['id', 'status'])
                                .then(match => {
                                    const queries = result.map(playerResult => 
                                        database('players').transacting(trx)
                                                           .where({ id: playerResult.id, team: playerResult.team, match_id: matchId })
                                                           .update({ 
                                                               goals: playerResult.goals >= 0 ? playerResult.goals : undefined,
                                                               assists: playerResult.assists >= 0 ? playerResult.assists : undefined,
                                                               saves: playerResult.saves >= 0 ? playerResult.saves : undefined,
                                                               shots: playerResult.shots >= 0 ? playerResult.shots : undefined,
                                                               new_rank: playerResult.rank,
                                                               new_division: playerResult.division,
                                                               mmr_change: playerResult.mmrChange
                                                            })
                                    );

                                    return Promise.all(queries);
                                })
                                .then(trx.commit)
                                .catch(trx.rollback);
                        })
                        .then(data => res.sendStatus(200))
                        .catch(data => res.sendStatus(500));
                    }
                } else {
                    res.sendStatus(403);
                }
            })
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
    }
}

const getMatches = (req, res, code, database) => {
    database.select('sessions.code', 'matches.id AS matchId', 'players.id AS playerId', 'players.name', 'players.platform', 'players.team', 'players.goals', 'players.assists', 'players.saves', 'players.shots', 'players.new_rank', 'players.new_division', 'players.mmr_change', 'matches.start_time', 'matches.mode', 'matches.status', 'matches.winner', 'matches.mvp')
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
            res.json(processMatches(data));
        }
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
}

const processMatches = data => {
    const matches = {};
    data.forEach(player => {
        const newPlayer = {
            name: player.name,
            id: player.playerId
        };
        if(player.platform) {
            newPlayer.platform = player.platform;
        }
        if(player.status === 'finished') {
            newPlayer.result = {};

            const addStat = (name, value) => {
                if (value !== null) {
                    newPlayer.result[name] = value;
                }
            }

            addStat('goals', player.goals);
            addStat('assists', player.assists);
            addStat('saves', player.saves);
            addStat('shots', player.shots);

            newPlayer.result.wins = player.team === player.winner ? 1 : 0;
            
            if (player.mvp !== null) {
                newPlayer.result.mvps = player.mvp === player.playerId ? 1 : 0;
            }

            newPlayer.result.rank = player.new_rank;
            newPlayer.result.division = player.new_division;
            newPlayer.result.mmrChange = player.mmr_change;
        }
        if(!matches[player.matchId]) {
            matches[player.matchId] = {
                players: [[], []],
                startTime: player.start_time,
                mode: player.mode,
                id: player.matchId
            };

            if (player.status !== 'playing') {
                switch(player.status) {
                    case 'completing':
                        matches[player.matchId].finished = { loading: true };
                        break;
                    case 'finished':
                        matches[player.matchId].finished = { completed: true };
                        break;
                    case 'error':
                        matches[player.matchId].finished = { error: true };
                    default:
                        break;
                }
            }
        }
        matches[player.matchId].players[player.team].push(newPlayer);
    });
    return Object.values(matches).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

const addSessionOwner = (req, res, sessionCode, database) => {
    const sessionId = req.tokenData.id;

    if(!req.body.ownerToken) {
        res.status(400).send('No owner token');
    } else {
        admin.auth().verifyIdToken(req.body.ownerToken)
            .then(owner => {
                const ownerId = owner.uid;

                database.select('code').from('sessions').where('id', '=', sessionId).first()
                .then(code => {
                    code = code.code;
                    if (code === sessionCode) {
                        database('session_owners').insert({ session_id: sessionId, user_id: ownerId }, '*')
                            .then(ownership => res.json(ownership))
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
                });
            })
            .catch(error => {
                console.log(error);
                res.sendStatus(403);
            });
    } 
}

const getMatchHistory = (req, res, database) => {
    const userId = req.id;

    database.select('matches.id AS matchId', 'matches.start_time', 'matches.mode', 'matches.status', 'matches.winner', 'matches.mvp', 'players.id AS playerId', 'players.name', 'players.platform', 'players.team', 'players.goals', 'players.assists', 'players.saves', 'players.shots', 'players.new_rank', 'players.new_division', 'players.mmr_change')
            .from('session_owners')
            .innerJoin('sessions', 'session_owners.session_id', 'sessions.id')
            .innerJoin('matches', 'sessions.id', 'matches.session_id')
            .innerJoin('players', 'matches.id', 'players.match_id')
            .where('session_owners.user_id', '=', userId)
            .then(data => {
                res.json(processMatches(data).sort((a,b) => new Date(b.startTime) - new Date(a.startTime)));
            })
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
}

const getPlayerAnalytics = (req, res, sessionCode, matchId, database) => {
    database.select('players.name', 'players.team')
            .from('players').innerJoin('matches', 'matches.id', 'players.match_id').innerJoin('sessions', 'sessions.id', 'matches.session_id')
            .where('matches.id', '=', matchId).andWhere('sessions.code', '=', sessionCode)
        .then(data => {

            if(data.length === 0) {
                res.status(400).send('Code or match does not exist');
                return;
            }

            var players = data.reduce((acc, player) => acc.map((teamAcc, i) => player.team === i ? teamAcc.concat(player.name) : teamAcc), [[],[]]);

            database.select('matches.id AS matchId', 'matches.start_time', 'matches.mode', 'matches.status', 'matches.winner', 'matches.mvp', 'players.id AS playerId', 'players.name', 'players.platform', 'players.team', 'players.goals', 'players.assists', 'players.saves', 'players.shots', 'players.new_rank', 'players.new_division', 'players.mmr_change')
                .from('sessions')
                .innerJoin('session_owners', 'sessions.id', 'session_owners.session_id')
                .innerJoin('matches', 'sessions.id', 'matches.session_id')
                .innerJoin('players', 'matches.id', 'players.match_id')
                .whereIn('session_owners.user_id', database.select('user_id').from('session_owners').innerJoin('sessions', 'session_owners.session_id', 'sessions.id').where('code', '=', sessionCode))
                .then(data => {
                    var matches = processMatches(data);
                    const STATS = ['goals', 'assists', 'saves', 'shots', 'wins', 'mvps'];

                    // Collect player stats
                    players = players.map(teamPlayers => teamPlayers.map(player => {
                        const playerData = { 
                            name: player,
                            games: 0
                        };
                        
                        STATS.forEach(stat => playerData[stat] = { games: 0, value: 0 });

                        matches.forEach(match => {
                            const blueTeamPlayer = match.players[0].filter(player => player.name === playerData.name)[0];
                            const orangeTeamPlayer = !blueTeamPlayer && match.players[1].filter(player => player.name === playerData.name)[0];
                            const player = blueTeamPlayer || orangeTeamPlayer;
                            if(player) {
                                playerData.games++;
                                if (player.result) {
                                    STATS.forEach(stat => {
                                        if (player.result[stat] !== null) {
                                            playerData[stat].games++;
                                            playerData[stat].value += player.result[stat];
                                        }
                                    })
                                }
                            }
                        });

                        STATS.forEach(stat => {
                            playerData[stat] = playerData[stat].games ? (playerData[stat].games >= 10 ? Math.round((playerData[stat].value / playerData[stat].games) * 10) / 10 : `${playerData[stat].value}/${playerData[stat].games}`) : undefined;
                        })

                        return playerData;
                    }));

                    // Calculate rank for each player so we can prioritise matches with rarer players
                    const playerRanks = {};
                    players[0].concat(players[1]).map(player => ({ name: player.name, games: player.games }))
                            .sort((a, b) => b.games - a.games)
                            .map((player, i) => ({ name: player.name, rank: Math.pow(i+1,2) }))
                            .forEach(player => playerRanks[player.name] = player.rank);

                    // Get top five matches by rank
                    matches = matches.filter(match => match.finished && match.finished.completed)
                                     .map(match => ({
                                         match,
                                         rank: match.players[0].concat(match.players[1]).map(player => playerRanks[player.name]).reduce((acc, rank) => rank ? acc + rank : acc, 0)
                                     }))
                                     .filter(matchRank => matchRank.rank)
                                     .sort((a,b) => {
                                         const r = b.rank - a.rank;
                                         if (r !== 0) {
                                             return r;
                                         }
                                         return b.match.startTime - a.match.startTime;
                                     })
                                     .slice(0,5)
                                     .map(matchRank => matchRank.match);

                    // Add focus property to player in match if they are one of the players involved in the game
                    matches = matches.map(match => ({ ...match, players: match.players.map(teamPlayers => teamPlayers.map(player => ({ ...player, focus: Object.keys(playerRanks).includes(player.name)})))}));

                    res.json({
                        matches,
                        players
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.sendStatus(500);
                });
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
}

const getPlayerStats = (req, res, username, database) => {
    const userId = req.id;
    
    database.select(database.raw('matches.start_time::date AS date'), 'mode', database.raw('COUNT(*) AS games'), database.raw('SUM(goals) AS goals'), database.raw('COUNT(goals) AS goals_games'), database.raw('SUM(assists) AS assists'), database.raw('COUNT(assists) AS assists_games'), database.raw('SUM(saves) AS saves'), database.raw('COUNT(saves) AS saves_games'), database.raw('SUM(shots) AS shots'), database.raw('COUNT(shots) AS shots_games'), database.raw('SUM(CASE WHEN winner = team THEN 1 ELSE 0 END) AS wins'), database.raw('SUM(CASE WHEN mvp IS NULL THEN null WHEN mvp = players.id THEN 1 ELSE 0 END) AS mvps'), database.raw('COUNT(CASE WHEN mvp IS NULL THEN null WHEN mvp = players.id THEN 1 ELSE 0 END) AS mvps_games'))
            .from('players').innerJoin('matches', 'matches.id', 'players.match_id').innerJoin('sessions', 'sessions.id', 'matches.session_id').innerJoin('session_owners', 'sessions.id', 'session_owners.session_id')
            .where('status', '=', 'finished').andWhere('name', '=', username).andWhere('user_id', '=', userId)
            .groupBy('date', 'mode')
            .orderBy('date')
        .then(data => {
            const processedData = [];
            let current = { modes: [] };
            data.forEach((record, index) => {
                if (current.date && new Date(record.date) > new Date(current.date)) {
                    // Start new date
                    processedData.push(current);
                    current = { modes: [] };
                }
                current.date = record.date;
                current.modes.push({
                    title: record.mode,
                    games: record.games,
                    wins: record.wins,
                    goals: {
                        value: record.goals,
                        games: record.goals_games
                    },
                    assists: {
                        value: record.assists,
                        games: record.assists_games
                    },
                    saves: {
                        value: record.saves,
                        games: record.saves_games
                    },
                    shots: {
                        value: record.shots,
                        games: record.shots_games
                    },
                    mvps: {
                        value: record.mvps,
                        games: record.mvps_games
                    }
                });
                if (index === data.length - 1) {
                    // Make sure last one gets pushed
                    processedData.push(current);
                }
            });
            res.json(processedData);
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
}

const checkValidSessionCode = (req, res, next) => {
    const code = req.params.code;

    if(code && isSessionCodeFormatValid(code)) {
        next();
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

const handleTokenIfExists = (req, res, next) => {
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
        next();
    }
}

const verifyToken = (req, res, next) => {
    jwt.verify(req.token, JWT_KEY, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE }, (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else {
            req.tokenData = data;
            next();
        }
    });
}

const verifyFirebaseId = (req, res, next) => {
    admin.auth().verifyIdToken(req.token)
        .then(user => {
            req.id = user.uid;
            req.username = user.name;
            next();
        })
        .catch(error => {
            res.sendStatus(403);
        });
}

module.exports = {
    addSession,
    addMatch,
    getMatches,
    editUsername,
    finishMatch,
    submitResult,
    addSessionOwner,
    getMatchHistory,
    getPlayerAnalytics,
    getPlayerStats,
    checkTokenExists,
    handleTokenIfExists,
    checkValidSessionCode,
    verifyToken,
    verifyFirebaseId
}