const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const image = require('./controllers/image');

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send("It's working!");
});

app.get('/google', async (req, res) => image.handleExtractUsernames(req, res));

app.listen(3001, () => {
	console.log(`Server is running on port 3001`);
});