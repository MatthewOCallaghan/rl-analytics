const jwt = require('jsonwebtoken');

const { JWT_KEY, JWT_ISSUER, JWT_AUDIENCE } = require('../config.js');

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const CODE_LENGTH = 6;

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
                    res.status(500).text('Error creating token');
                }
                res.json({
                    token,
                    code: session.code,
                    startTime: session.start_time
                });
            })
        })
        .catch(err => res.status(500).json(err));
    })
    .catch(err => res.status(500).json(err));
}

module.exports = {
    addSession
}