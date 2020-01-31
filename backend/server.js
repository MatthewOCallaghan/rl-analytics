const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const image = require('./controllers/image');
const scrape = require('./controllers/scrape');

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send("It's working!");
});

app.get('/extract', async (req, res) => image.handleExtractUsernames(req, res));

app.get('/profile/:name', (req, res) => scrape.combined(res, req.params.name));

app.get('/profile/:name/charts', (req, res) => scrape.getChartData(res, req.params.name));

app.get('/profile/:name/stats', (req, res) => scrape.getOverview(res, req.params.name));

app.get('/profile/:name/ranks', (req, res) => scrape.getSeasonRanks(res, req.params.name));

app.get('/profile/:name/mmr', (req, res) => scrape.getRatingDetail(res, req.params.name));

app.get('/profile/:name/updates', (req, res) => scrape.getUpdates(res, req.params.name));

module.exports = app;