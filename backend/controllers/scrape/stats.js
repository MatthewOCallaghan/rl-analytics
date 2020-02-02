const { scrape } = require('./scrape');

const statsScrape = scrape('div.stat', 
        [
            { 
                name: 'div.name | trim', 
                value: 'div.value | trim | removeCommas | stringToFloat', 
                rank: 'div.rank | trim | removeCommas | extractRank'
            }
        ]
    );

getStats = async (name, platform) => {
    return await scrape(`https://rocketleague.tracker.network/profile/${platform}/${name}`, 'body', statsScrape)
}

module.exports = {
    statsScrape,
    getStats
}