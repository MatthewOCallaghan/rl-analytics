const toObject = require('convert-to-object');

const scrape = require('./scrape');

const mmrScrape = {
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
};

getRatingDetail = (res, name) => {
    scrape(`https://rocketleague.tracker.network/profile/mmr/ps/${name}`, 'div.content-container', mmrScrape)
        .then(processMMRData)
        .then(data => res.json(data));
}

const processMMRData = data => {
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
    return data.playlists.map(playlist => { // Combining data and stats for each playlist
                playlist.data = data.scripts.filter(script => script.id === parseInt(playlist.id))[0].data;
                playlist.name = playlist.data.name;
                playlist.stats = playlist.stats.filter(stat => stat.name) // Remove empty stats that shouldn't have been scraped
                delete playlist.data.name;
                delete playlist.id;
                return playlist;
            })
            .map(playlist => {
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
            });
}

module.exports = {
    mmrScrape,
    getRatingDetail,
    processMMRData
}