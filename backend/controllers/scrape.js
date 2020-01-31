const xray = require('x-ray');
const toObject = require('convert-to-object');

const scrape = xray({
    filters: {
        chartData: value => typeof value === 'string' && value.trim().charAt(0) === '$' ? value : null,
        trim: string => typeof string === 'string' ? string.trim() : string,
        removeCommas: value => removeCommas(value),
        stringToInt: string => typeof string === 'string' ? parseInt(string) : string,
        stringToFloat: string => typeof string === 'string' ? parseFloat(string) : string,
        extractRank: rank => {
            if(typeof rank === 'string') {
                const posMatch = rank.match(/#\d+/);
                const perMatch = rank.match(/Top \d\d?(.\d\d?)?%/);
                return {
                           position: posMatch != null && posMatch.length > 0 ? parseInt(posMatch[0].substring(1)) : null,
                           percentage: posMatch != null && perMatch.length > 0 ? parseFloat(perMatch[0].substring(4, perMatch[0].length - 1)) : null
                       }
            }
            return rank;
        },
        extractSeason: season => {
            if(typeof season === 'string') {
                const num = season.match(/\d+/);
                if (num != null && num.length > 0) {
                    return parseInt(num[0]);
                }
            }
            return season;
        },
        removeNestedHTML: value => removeNestedHTML(value)
    }
});

getSeasonRanks = (res, name) => {
    scrape(`https://rocketleague.tracker.network/profile/ps/${name}`, 'div.profile-main', scrape('div.season-table',
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
        ]))
        .then(seasons => seasons.map(season => {  // Removes empty rows and first column (which contains rank image)
            season.tables.forEach(table => {
                table.rows = table.rows.filter(row => row.values.length > 0).map(row => row.values.slice(1, row.values.length));
            });
            return season;
        }))
        .then(seasons => seasons.map(season => {
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
        }))
        .then(data => res.json(data));
}

getOverview = (res, name) => {
    scrape(`https://rocketleague.tracker.network/profile/ps/${name}`, 'body', scrape('div.stat', 
        [
            { 
                name: 'div.name | trim', 
                value: 'div.value | trim | removeCommas | stringToFloat', 
                rank: 'div.rank | trim | removeCommas | extractRank'
            }
        ]
    ))
        .then(data => res.json(data));
}

getRatingDetail = (res, name) => {
    scrape(`https://rocketleague.tracker.network/profile/mmr/ps/${name}`, 'div.content-container', {
        scripts: [`script[type='text/javascript'] | trim`],
        playlists: scrape('div.stats', 
            [
                {
                    id: '@data-id',
                    stats: scrape('div', 
                        [
                            {
                                name: 'h4',
                                value: ['span'],
                                colour: ['span@style']
                            }
                        ]
                    )
                }
            ]
        )
    })
        .then(data => {
            let regexGlobal = /data\['\d+'\] ?= ?{((?!data).)+}/gs;
            let regex = /data\['(\d+)'\] ?= ?({((?!data).)+})/s;
            data.scripts = data.scripts.filter(script => script.match(regexGlobal) != null)[0] // Filter down to just scripts we want
                                       .match(regexGlobal)                                     // Obtain each playlist data as string in array
                                       .map(playlist => {                                      // Extract object from string
                                           const result = playlist.match(regex);
                                           return {
                                               id: parseInt(result[1]),
                                               data: toObject(result[2])
                                           };
                                       });
            return data;
        })
        .then(data => data.playlists.map(playlist => { // Combining data and stats for each playlist
                playlist.data = data.scripts.filter(script => script.id === parseInt(playlist.id))[0].data;
                playlist.name = playlist.data.name;
                playlist.stats = playlist.stats.filter(stat => stat.name) // Remove empty stats that shouldn't have been scraped
                delete playlist.data.name;
                delete playlist.id;
                return playlist;
        }))
        .then(playlists => playlists.map(playlist => {
            playlist.stats.forEach(stat => {
                if(stat.value.length > 0) {
                    switch (stat.name) {
                        case 'Games Played':
                            playlist.games = parseInt(stat.value[0]);
                            break;
                        case 'Percentile':
                            playlist.percentile = parseInt(stat.value[0].replace(/Top (\d+)%/, '$1'));
                            break;
                        case 'Division Up/Down':
                            if(stat.value.length > 1) {
                                playlist.divUp = parseInt(stat.value[0].replace(/~/g, ''));
                                playlist.divDown = parseInt(stat.value[1].replace(/~/g, ''));
                            } else if (stat.colour.length > 0 && /^color:(red|green);$/.test(stat.colour[0])){
                                if (stat.colour[0].includes('red')) {
                                    playlist.divDown = parseInt(stat.value[0].replace(/~/g, ''));
                                } else {
                                    playlist.divUp = parseInt(stat.value[0].replace(/~/g, ''));
                                }
                            }
                            break;
                        case 'Tier Up/Down':
                            if(stat.value.length > 1) {
                                playlist.tierUp = parseInt(stat.value[0].replace(/~/g, ''));
                                playlist.tierDown = parseInt(stat.value[1].replace(/~/g, ''));
                            } else if (stat.colour.length > 0 && /^color:(red|green);$/.test(stat.colour[0])){
                                if (stat.colour[0].includes('red')) {
                                    playlist.tierDown = parseInt(stat.value[0].replace(/~/g, ''));
                                } else {
                                    playlist.tierUp = parseInt(stat.value[0].replace(/~/g, ''));
                                }
                            }
                            break;
                        default:
                            if(stat.name.match(/Division I+V?/) != null) {
                                playlist.rank = stat.value[0] + ' ' + stat.name;
                            }
                            break;
                    }
                }
            })
            delete playlist.stats;
            return playlist;
        }))
        .then(data => res.json(data));
}

getUpdates = (res, name) => {
    scrape(`https://rocketleague.tracker.network/profile/updates/ps/${name}`, '.profile-main', {
        times: scrape('h2.card-title', 
            [
                {
                    time: 'span@data-livestamp'
                }
            ]
        ),
        updates: scrape('.card', 
            [
                {
                    stats: scrape('.stat', 
                        [
                            {
                                name: '.name | trim',
                                value: '.value | trim | removeCommas | stringToFloat'
                            }
                        ]
                    )
                }
            ]
        )
    })
        .then(data => { // Remove empty updates (i.e. .card class divs that weren't supposed to be scraped)
            data.updates = data.updates.filter(update => update.stats.length > 0);
            return data;
        })
        .then(data => 
            data.updates.map((update, index) => {
                update.time = data.times[index].time;
                return update;
            })
        )
        .then(data => res.json(data));
}

getChartData = (res, name) => {
    scrape(`https://rocketleague.tracker.network/profile/ps/${name}`, 'body', scrape('.content-container div', ['script | chartData']))
        .then(data => data.filter(script => script !== null))
        .then(data => data.map(script => script.trim().split(`$('#`).slice(1)))
        .then(data => data.reduce((acc, val) => acc.concat(val), []))
        .then(chartCodeArrayToObject)
        .then(data => res.json(data));
}

chartCodeArrayToObject = arr => {
    var obj = {};
    arr.forEach(chart => {
        chart = chart.trim();
        const quoteIndex = chart.indexOf(`'`);
        const name = chart.substring(0, quoteIndex);
        var val = toObject(chart.substring(quoteIndex + 14, chart.length - 2));
        obj[name] = val;
    });
    return obj;
}

removeCommas = value => typeof value === 'string' ? value.replace(/,/g, '') : value;

removeNestedHTML = value => typeof value === 'string' ? value.replace(/<(.|\n)*>/g, '') : value;


const chartScrape = scrape('.content-container div', ['script | chartData']);
const overviewScrape = scrape('div.stat', 
        [
            { 
                name: 'div.name | trim', 
                value: 'div.value | trim | removeCommas | stringToFloat', 
                rank: 'div.rank | trim | removeCommas | extractRank'
            }
        ]
    );

combined = (res, name) => {
    scrape(`https://rocketleague.tracker.network/profile/ps/${name}`, 'body', {
        overview: overviewScrape,
        chart: chartScrape
    })
        .then(data => {
            // data.chart = processChartData(data.chart);
            return data;
        })
        .then(data => res.json(data));
}


const processChartData = data => {
    // data = data.filter(x => x);
    data = data.map(script => script.trim().split(`$('#`).slice(1));
    data = data.reduce((acc, val) => acc.concat(val), []);
    data = chartCodeArrayToObject(data);
    return data;
}








module.exports = {
    getChartData,
    getOverview,
    getSeasonRanks,
    getRatingDetail,
    getUpdates,
    combined
}