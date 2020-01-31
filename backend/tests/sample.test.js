const app = require('../server');
const supertest = require('supertest');

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
    it('image1', async () => {
        const res = await request.get('/extract');
        expect(res.statusCode).toEqual(200);
    })
});

server.close();