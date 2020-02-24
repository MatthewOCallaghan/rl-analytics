const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

const { DATABASE_USER, DATABASE_PASSWORD } = require('./config');

const database = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: DATABASE_USER,
		password: DATABASE_PASSWORD,
		database: 'rl_analytics'
	}
});

const app = express();

const image = require('./controllers/image');

const { handleScrapingRequest } = require('./controllers/scrape/scrape');
const { handleGetAllProfileData } = require('./controllers/scrape/profile');
const { getChartData } = require('./controllers/scrape/charts');
const { getStats } = require('./controllers/scrape/stats');
const { getSeasonRanks } = require('./controllers/scrape/ranks');
const { getRatingDetail } = require('./controllers/scrape/mmr');
const { getUpdates } = require('./controllers/scrape/updates');
const { addSession, addMatch, getMatches, checkTokenExists } = require('./controllers/sessions');

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(cors());

app.get('/', (req, res) => {
	res.send("It's working!");
});

app.post('/extract', async (req, res) => await image.handleExtractUsernames(req, res));

app.get('/profile/:name', async (req, res) => await handleGetAllProfileData(res, req.params.name, req.query.platform));

app.get('/profile/:name/charts', async (req, res) => await handleScrapingRequest(res, req.params.name, req.query.platform, getChartData));

app.get('/profile/:name/stats', async (req, res) => await handleScrapingRequest(res, req.params.name, req.query.platform, getStats));

app.get('/profile/:name/ranks', async (req, res) => await handleScrapingRequest(res, req.params.name, req.query.platform, getSeasonRanks));

app.get('/profile/:name/mmr', async (req, res) => await handleScrapingRequest(res, req.params.name, req.query.platform, getRatingDetail));

app.get('/profile/:name/updates', async (req, res) => await handleScrapingRequest(res, req.params.name, req.query.platform, getUpdates));

app.post('/sessions', (req, res) => addSession(req, res, database));

app.post('/sessions/:code', checkTokenExists, (req, res) => addMatch(req, res, database));

app.get('/sessions/:code', (req, res) => getMatches(req, res, req.params.code, database));

module.exports = app;