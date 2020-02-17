const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const image = require('./controllers/image');

const { handleScrapingRequest } = require('./controllers/scrape/scrape');
const { handleGetAllProfileData } = require('./controllers/scrape/profile');
const { getChartData } = require('./controllers/scrape/charts');
const { getStats } = require('./controllers/scrape/stats');
const { getSeasonRanks } = require('./controllers/scrape/ranks');
const { getRatingDetail } = require('./controllers/scrape/mmr');
const { getUpdates } = require('./controllers/scrape/updates');

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

module.exports = app;