const app = require('../server');
const supertest = require('supertest');
const fs = require('fs');
const { correctOutput: correctImageExtractions, googleOutput: googleImageExtractions } = require('./image-usernames');

const GAME_MODES = require('../controllers/sessions').GAME_MODES.map(mode => mode.title);

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

// describe('Username extraction', () => {
//     const FILE_EXTENSION = /\.[^/.]+$/;
//     const images = fs.readdirSync('images/');
//     images.forEach((image) => {
//         var response = {};

//         beforeAll(async () => {
//             jest.setTimeout(30000);
//             response = await request.post('/extract')
//                 .send({
//                     image: fs.readFileSync(`images/${image}`).toString('base64')
//                 });
//         });

//         it(image, async () => {
//             expect(response.statusCode).toEqual(200);
//             expect(response.body.players).toEqual(correctImageExtractions[image.replace(FILE_EXTENSION, "")]);
//         });

//         it(image + '- just my algorithm', async () => {
//             if(googleImageExtractions[image.replace(FILE_EXTENSION, "")]) {
//                 expect(response.body.players).toEqual(googleImageExtractions[image.replace(FILE_EXTENSION, "")]);
//             } else {
//                 expect(response.body.players).toEqual(correctImageExtractions[image.replace(FILE_EXTENSION, "")]);
//             }
//         })
//     });
// });

describe('Web scraping', () => {
    const users = [
        {
            username: 'MattyOCallaghan',
            platform: 'ps'
        },
        {
            username: 'MadMax345',
            platform: 'xbox'
        },
        {
            username: 'T Breezy',
            platform: 'steam'
        }
    ];

    const isValidResponse = (expectedPlatform, response) => Array.isArray(response) && response.length === 1 && response[0].platform === expectedPlatform && response[0].data;

    const isValidStats = data => Array.isArray(data) && ['Wins', 'Goals', 'Saves', 'Shots', 'MVPs', 'Assists'].every(statName => data.filter(stat => stat.name === statName).length === 1 && data.filter(stat => stat.name === stat).every(stat => stat.value && Number.isFinite(stat.value)));

    const isValidCharts = data => typeof data === 'object' && data !== null && data['goal-shots'] && isValidGraph(data['goal-shots']) && data['goal-and-shots'] && isValidGraph(data['goal-and-shots']) && data.trio && isValidGraph(data.trio) && data['trio-breakdown'] && isValidPieChart(data['trio-breakdown']) && data['playlist-tracking-rating'] && isValidGraph(data['playlist-tracking-rating']) && data['playlist-tracking'] && isValidGraph(data['playlist-tracking']);

    const isValidGraph = graph => graph.xAxis && Array.isArray(graph.xAxis.categories) && Array.isArray(graph.series) && graph.series.every(plot => plot.name && (Number.isFinite(plot.data) || Array.isArray(plot.data)));

    const isValidPieChart = chart => Array.isArray(chart.series) && chart.series.every(segments => segments.name && Array.isArray(segments.data) && segments.data.every(segment => segment.name && Number.isFinite(segment.y)));

    const isValidRanks = data => Array.isArray(data) && data.every(season => Number.isFinite(season.season) && GAME_MODES.every(mode => !season[mode] || typeof season[mode].rank === 'string' && Number.isFinite(season[mode].rating) && season[mode].games && Number.isFinite(season[mode].games.count) && (!season[mode].games.streak || season[mode].games.streak.length && season[mode].games.streak.type)));

    const isValidMMR = data => Array.isArray(data) && data.every(mode => GAME_MODES.concat('Un-Ranked').includes(mode.name) && Number.isFinite(mode.games) && mode.data && typeof mode.data === 'object' && Array.isArray(mode.data.categories) && Array.isArray(mode.data.rating));

    const isValidUpdates = data => Array.isArray(data) && data.every(update => Array.isArray(update.stats) && update.stats.every(stat => typeof stat.name === 'string' && Number.isFinite(stat.value)) && update.time);

    const isValidProfile = data => typeof data === 'object' && isValidStats(data.stats) && isValidCharts(data.charts) && isValidRanks(data.ranks) && isValidMMR(data.mmr) && isValidUpdates(data.updates);

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        for (let p = 0; p < 2; p++) {
            const includePlatform = p === 0;

            if (user.platform === 'steam') {
                beforeEach(() => {
                    jest.setTimeout(30000);
                });
            }

            const getTestName = data => `should get ${data} for ${user.platform} user ${user.username} (${includePlatform ? 'with' : 'no'} platform)`;

            it(getTestName('stats', user), () => {
                return request.get(`/profile/${user.username}/stats${includePlatform ? `?platform=${user.platform}` : ''}`)
                    .then(response => {
                        expect(response.statusCode).toEqual(200);
                        expect(isValidResponse(user.platform, response.body)).toBeTruthy();
                        expect(isValidStats(response.body[0].data)).toBeTruthy();
                    });
            });

            it(getTestName('charts', user), () => {
                return request.get(`/profile/${user.username}/charts${includePlatform ? `?platform=${user.platform}` : ''}`)
                    .then(response => {
                        expect(response.statusCode).toEqual(200);
                        expect(isValidResponse(user.platform, response.body)).toBeTruthy();
                        expect(isValidCharts(response.body[0].data)).toBeTruthy();
                    });
            });

            it(getTestName('ranks', user), () => {
                return request.get(`/profile/${user.username}/ranks${includePlatform ? `?platform=${user.platform}` : ''}`)
                    .then(response => {
                        expect(response.statusCode).toEqual(200);
                        expect(isValidResponse(user.platform, response.body)).toBeTruthy();
                        expect(isValidRanks(response.body[0].data)).toBeTruthy();
                    });
            });

            it(getTestName('mmr', user), () => {
                return request.get(`/profile/${user.username}/mmr${includePlatform ? `?platform=${user.platform}` : ''}`)
                    .then(response => {
                        expect(response.statusCode).toEqual(200);
                        expect(isValidResponse(user.platform, response.body)).toBeTruthy();
                        expect(isValidMMR(response.body[0].data)).toBeTruthy();
                    });
            });

            it(getTestName('updates', user), () => {
                return request.get(`/profile/${user.username}/updates${includePlatform ? `?platform=${user.platform}` : ''}`)
                    .then(response => {
                        expect(response.statusCode).toEqual(200);
                        expect(isValidResponse(user.platform, response.body)).toBeTruthy();
                        expect(isValidUpdates(response.body[0].data)).toBeTruthy();
                    });
            });

            it(getTestName('profile', user), () => {
                return request.get(`/profile/${user.username}${includePlatform ? `?platform=${user.platform}` : ''}`)
                    .then(response => {
                        expect(response.statusCode).toEqual(200);
                        expect(isValidResponse(user.platform, response.body)).toBeTruthy();
                        expect(isValidProfile(response.body[0].data)).toBeTruthy();
                    });
            });
        }
    }

    // Non-existent user
    it(`should be unable to get stats for non-existent user`, () => {
        return request.get(`/profile/Does not exist/stats`)
            .then(response => {
                expect(response.statusCode).toEqual(200);
                expect(response.body).toEqual([]);
            });
    });

    it(`should be unable to get charts for non-existent user`, () => {
        return request.get(`/profile/Does not exist/charts`)
            .then(response => {
                expect(response.statusCode).toEqual(200);
                expect(response.body).toEqual([]);
            });
    });

    it(`should be unable to get ranks for non-existent user`, () => {
        return request.get(`/profile/Does not exist/ranks`)
            .then(response => {
                expect(response.statusCode).toEqual(200);
                expect(response.body).toEqual([]);
            });
    });

    it(`should be unable to get mmr for non-existent user`, () => {
        return request.get(`/profile/Does not exist/mmr`)
            .then(response => {
                expect(response.statusCode).toEqual(200);
                expect(response.body).toEqual([]);
            });
    });

    it(`should be unable to get updates for non-existent user`, () => {
        return request.get(`/profile/Does not exist/updates`)
            .then(response => {
                expect(response.statusCode).toEqual(200);
                expect(response.body).toEqual([]);
            });
    });

    it(`should be unable to get profile for non-existent user`, () => {
        return request.get(`/profile/Does not exist`)
            .then(response => {
                expect(response.statusCode).toEqual(200);
                expect(response.body).toEqual([]);
            });
    });

})

server.close();

