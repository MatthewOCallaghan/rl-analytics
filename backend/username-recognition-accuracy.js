// Methods for measuring accuracy of username recognition algorithm
// Requires test images in backend/test/images folder (not included in git)

const app = require('./server');
const supertest = require('supertest');
const fs = require('fs');
const stringSimilarity = require('string-similarity');
const { correctOutput: correctImageExtractions, googleOutput: googleImageExtractions } = require('./tests/image-usernames');

const writeResponses = async () => {
    const server = app.listen(3002, () => {
        console.log(`Server is running on port 3002`);
    });
    
    const request = supertest(app);

    const FILE_EXTENSION = /\.[^/.]+$/;
    const images = fs.readdirSync('images/');
    const output = {};
    for(var i = 0; i < images.length; i++) {
        const image = images[i];
        const response = await request.post('/extract')
                                        .send({
                                            image: fs.readFileSync(`images/${image}`).toString('base64')
                                        });
        output[image.replace(FILE_EXTENSION, "")] = response.body.players;
    }
    fs.writeFileSync('responses.json', JSON.stringify(output));

    server.close();
}

const getAccuracy = async () => {
    const responses = require('./responses.json');
    var allSimilarities = 0;
    var wrongSimilarities = 0;
    var wrongSimilaritiesArr = [];
    var imperfectImages = 0;
    var allImages = 0;
    const totals = Object.entries(responses).filter(([key, arr]) => arr[0].length === 3).reduce(([correctSum, totalSum], [ image, response ]) => {
        let expected = correctImageExtractions[image];
        var similarities = expected.map((team, index) => team.map(username => Math.max(...response[index].map(r => stringSimilarity.compareTwoStrings(r, username)))));
        similarities = similarities[0].concat(similarities[1]);
        allSimilarities += similarities.reduce((acc, s) => acc + s);
        wrongSimilarities += similarities.reduce((acc, s) => s < 1 ? acc + s : acc, 0);
        wrongSimilaritiesArr.push(...similarities.filter(s => s < 1));
        if (similarities.filter(s => s < 1).length > 0) {
            imperfectImages++;
        }
        allImages++;
        const correct = expected.reduce((acc, team, index) => acc + team.reduce((acc, username) => response[index].includes(username) ? acc + 1 : acc, 0), 0);
        return [correct + correctSum, totalSum + expected[0].length + expected[1].length];
    }, [0,0]);

    console.log(`Correct usernames: ${totals[0]}`);
    console.log(`All usernames: ${totals[1]}`);
    console.log(`Wrong usernames: ${totals[1] - totals[0]}`);
    console.log(`Similarity sum: ${allSimilarities}`);
    console.log(`Wrong similarity sum: ${wrongSimilarities}`);
    console.log(`Average similarity: ${allSimilarities / totals[1]}`);
    console.log(`Average wrong similarity: ${wrongSimilarities / (totals[1] - totals[0])}`);
    console.log(`Number of wrong sims >= 0.75: ${wrongSimilaritiesArr.filter(s => s >= 0.75).length}`);
    console.log(`Number of wrong sims = 0: ${wrongSimilaritiesArr.filter(s => s === 0).length}`);
    console.log(`Imperfect images: ${imperfectImages}`);
    console.log(`All images: ${allImages}`);

    // console.log(stringSimilarity.compareTwoStrings('Username', 'username'));
    // console.log(stringSimilarity.compareTwoStrings('Testing', 'Username'));
}

// writeResponses();
getAccuracy();