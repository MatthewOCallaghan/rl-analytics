const { scrape } = require('./scrape');

const ranksScrape = scrape('div.season-table',
[
    { 
        season: '@id | extractSeason', 
        tables: scrape('table', 
            [
                { 
                    headings: ['th'], 
                    rows: scrape('tbody', scrape('tr', 
                        [
                            {
                                values: scrape('td', //['td@html | trim']
                                    [
                                        {
                                            style: '@style',
                                            text: '@ | trim',
                                            html: '@html | trim',
                                            span: 'span | trim',
                                            small: 'small | trim',
                                            seasonRank: '.season-rank | trim'
                                        }
                                    ]
                                )
                            }
                        ]
                    ))
                }
            ]
        )
    }
]);

getSeasonRanks = async (name, platform) => {
    return await scrape(`https://rocketleague.tracker.network/profile/${platform}/${name}`, 'body', ranksScrape)
        .then(processRanksData);
}

const processRanksData = data => {
    return data.map(season => {  // Removes empty rows and first column (which contains rank image)
                season.tables.forEach(table => {
                    table.rows = table.rows.filter(row => row.values.length > 0).map(row => row.values.slice(1, row.values.length));
                });
                return season;
            })
            .map(season => {
                const { tables } = season;
                season.rewardLevel = null;
                tables.forEach(table => {
                    const type = table.headings[0].split(' ')[0];
                    if (type === 'Playlist') {
                        table.rows.forEach(row => {
                            var mode = {};
                            for (let column = 0; column < row.length; column++) {
                                switch (table.headings[column]) {
                                    case 'Playlist':
                                        mode.rank = row[column].small;
                                    case 'Div Down':
                                        if(row[column].span) {
                                            mode.divDown = parseInt(row[column].span.replace(/~/g, ''));
                                        }
                                        break;
                                    case 'Rating':
                                        mode.rating = parseInt(removeCommas(removeNestedHTML(row[column].html).trim()));
                                        break;
                                    case 'Div Up':
                                        if(row[column].span) {
                                            mode.divUp = parseInt(row[column].span.replace(/~/g, ''));
                                        }
                                        break;
                                    case 'Games':
                                        if (row[column] === 'n/a') {
                                            mode.games = null;
                                        } else {
                                            mode.games = {
                                                count: parseInt(removeCommas(removeNestedHTML(row[column].html).trim())),
                                                streak: row[column].small
                                            };
                                        }
                                        break;
                                    default:
                                        console.log(season.season + ":" + row[column]);
                                        break;
                                }
                            }
                            season[removeNestedHTML(row[0].html).trim()] = mode;
                        });
                    } else if (type === 'Reward' && table.rows.length > 0 && table.rows[0].length >= 2) {
                        season.rewardLevel = {
                            rank: table.rows[0][0].small,
                            wins: parseInt(removeNestedHTML(table.rows[0][1].html).trim())
                        };
                    }
                });
                delete season.tables;
                return season;
            });
}

module.exports = {
    ranksScrape,
    getSeasonRanks,
    processRanksData
}