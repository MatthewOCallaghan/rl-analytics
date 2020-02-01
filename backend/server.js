const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const image = require('./controllers/image');

const { handleAllProfileData } = require('./controllers/scrape/profile');
const { getChartData } = require('./controllers/scrape/charts');
const { getStats } = require('./controllers/scrape/stats');
const { getSeasonRanks } = require('./controllers/scrape/ranks');
const { handleGetRatingDetail } = require('./controllers/scrape/mmr');
const { handleGetUpdates } = require('./controllers/scrape/updates');


app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send("It's working!");
});

app.post('/extract', async (req, res) => await image.handleExtractUsernames(req, res));

app.get('/profile/:name', async (req, res) => await handleAllProfileData(res, req.params.name));

app.get('/profile/:name/charts', (req, res) => getChartData(res, req.params.name));

app.get('/profile/:name/stats', (req, res) => getStats(res, req.params.name));

app.get('/profile/:name/ranks', (req, res) => getSeasonRanks(res, req.params.name));

app.get('/profile/:name/mmr', async (req, res) => await handleGetRatingDetail(res, req.params.name));

app.get('/profile/:name/updates', async (req, res) => await handleGetUpdates(res, req.params.name));

module.exports = app;