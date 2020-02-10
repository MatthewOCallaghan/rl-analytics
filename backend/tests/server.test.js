const app = require('../server');
const supertest = require('supertest');
const fs = require('fs');
const { correctOutput: correctImageExtractions, googleOutput: googleImageExtractions } = require('./image-usernames');

const server = app.listen(3002, () => {
	console.log(`Server is running on port 3002`);
});

const request = supertest(app);

describe('Server', () => {
    it('should be live', async () => {
        const response = await request.get('/');
        expect(response.statusCode).toEqual(200);
        expect(response.text).toEqual("It's working!");
    })
});

// describe('Image extraction', () => {
//     const images = fs.readdirSync('images/');
//     images.forEach(image => {
//         it(image, async () => {
//             console.log('Image: ' + image);
//             const response = await request.post('/extract')
//                 .send({
//                     image: `images/${image}`
//                 });
//             console.log('   Response received')
//             expect(response.statusCode).toEqual(200);
//             expect(response.body.players).toEqual(correctImageExtractions[image.replace(/\.[^/.]+$/, "")]);
//         });
//     });
// });

describe('Image extraction', () => {
    const images = fs.readdirSync('images/');
    images.forEach(image => {

        var response = {};

        beforeAll(async () => {
            response = await request.post('/extract')
                .send({
                    image: `images/${image}`
                });
        })

        it(image, async () => {
            expect(response.statusCode).toEqual(200);
            expect(response.body.players).toEqual(correctImageExtractions[image.replace(/\.[^/.]+$/, "")]);
        });

        it(image + '- just my algorithm', async () => {
            if(googleImageExtractions[image.replace(/\.[^/.]+$/, "")]) {
                expect(response.body.players).toEqual(googleImageExtractions[image.replace(/\.[^/.]+$/, "")]);
            } else {
                expect(response.body.players).toEqual(correctImageExtractions[image.replace(/\.[^/.]+$/, "")]);
            }
        })
    });
});

describe('Web scraping', () => {
    
})

server.close();

