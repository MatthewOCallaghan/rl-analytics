const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

const DATABASE_CONFIG = {
	client: 'pg',
	connection: {
		connectionString: process.env.DATABASE_URL,
		ssl: true,
	}
}

if (process.env.NODE_ENV !== 'production') {
	const { DATABASE_USER, DATABASE_PASSWORD } = require('./config');

	DATABASE_CONFIG.connection = {
		host: '127.0.0.1',
		user: DATABASE_USER,
		password: DATABASE_PASSWORD,
		database: 'rl_analytics'
	}
}

const database = knex(DATABASE_CONFIG);

const app = express();

const image = require('./controllers/image');

const { handleScrapingRequest } = require('./controllers/scrape/scrape');
const { handleGetAllProfileData } = require('./controllers/scrape/profile');
const { getChartData } = require('./controllers/scrape/charts');
const { getStats } = require('./controllers/scrape/stats');
const { getSeasonRanks } = require('./controllers/scrape/ranks');
const { getRatingDetail } = require('./controllers/scrape/mmr');
const { getUpdates } = require('./controllers/scrape/updates');
const { addSession, addMatch, getMatches, checkTokenExists, editUsername, finishMatch, submitResult, handleTokenIfExists, checkValidSessionCode, verifyToken } = require('./controllers/sessions');

const ALLOWED_ORIGINS = ['http://rocketleagueanalytics.herokuapp.com', 'http://localhost:3000'];

const CORS_OPTIONS = {
	origin: (origin, callback) => {
		if(origin && !ALLOWED_ORIGINS.includes(origin)) {
			return callback(new Error('Access from specified origin blocked by CORS policy'), false);
		}
		return callback(null, true);
	},
	// methods: ['GET', 'POST', 'PATCH'],
	// preflightContinue: true,
	// credentials: true
};

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(cors(CORS_OPTIONS));

app.get('/', (req, res) => {
	res.send("It's working!");
});

app.post('/extract', async (req, res) => await image.handleExtractUsernames(req, res));

app.get('/profile/:name', async (req, res) => await handleGetAllProfileData(res, req.params.name.replace(' ', '%20'), req.query.platform));

app.get('/profile/:name/charts', async (req, res) => await handleScrapingRequest(res, req.params.name.replace(' ', '%20'), req.query.platform, getChartData));

app.get('/profile/:name/stats', async (req, res) => await handleScrapingRequest(res, req.params.name.replace(' ', '%20'), req.query.platform, getStats));

app.get('/profile/:name/ranks', async (req, res) => await handleScrapingRequest(res, req.params.name.replace(' ', '%20'), req.query.platform, getSeasonRanks));

app.get('/profile/:name/mmr', async (req, res) => await handleScrapingRequest(res, req.params.name.replace(' ', '%20'), req.query.platform, getRatingDetail));

app.get('/profile/:name/updates', async (req, res) => await handleScrapingRequest(res, req.params.name.replace(' ', '%20'), req.query.platform, getUpdates));

app.post('/sessions', handleTokenIfExists, async (req, res) => await addSession(req, res, database));

app.post('/sessions/:code', checkTokenExists, checkValidSessionCode, verifyToken, async (req, res) => await addMatch(req, res, database));

app.get('/sessions/:code', checkValidSessionCode, (req, res) => getMatches(req, res, req.params.code, database));

app.put('/sessions/:code/:match/status', checkTokenExists, checkValidSessionCode, verifyToken, (req, res) => finishMatch(req, res, req.params.code, req.params.match, database));

app.post('/sessions/:code/:match/result', checkTokenExists, checkValidSessionCode, verifyToken, (req, res) => submitResult(req, res, req.params.code, req.params.match, database));

app.options('/sessions/:code/:match/:team/:player', cors(CORS_OPTIONS));
app.put('/sessions/:code/:match/:team/:player', checkTokenExists, checkValidSessionCode, verifyToken, (req, res) => editUsername(req, res, database));

module.exports = app;