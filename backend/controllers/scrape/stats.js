const scrape = require('./scrape');

const statsScrape = scrape('div.stat', 
        [
            { 
                name: 'div.name | trim', 
                value: 'div.value | trim | removeCommas | stringToFloat', 
                rank: 'div.rank | trim | removeCommas | extractRank'
            }
        ]
    );

getStats = (res, name) => {
    scrape(`https://rocketleague.tracker.network/profile/ps/${name}`, 'body', statsScrape)
        .then(data => res.json(data));
}

module.exports = {
    statsScrape,
    getStats
}