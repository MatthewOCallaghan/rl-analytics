const app = require('../server');
const supertest = require('supertest');
const fs = require('fs');
const correctImageExtractions = require('./image-usernames');

const server = app.listen(3001, () => {
	console.log(`Server is running on port 3001`);
});

const request = supertest(app);

describe('Server', () => {
    it('should be live', async () => {
        const response = await request.get('/');
        expect(response.statusCode).toEqual(200);
        expect(response.text).toEqual("It's working!");
    })
});

describe('Image extraction', () => {
    const images = fs.readdirSync('images/');

    images.forEach(image => {
        it(image, async () => {
            const response = await request.post('/extract')
                .send({
                    image: `images/${image}`
                });
            expect(response.statusCode).toEqual(200);
            expect(response.body.players).toEqual(correctImageExtractions[image]);
        });
    });
});

server.close();