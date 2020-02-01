const scrape = require('./scrape');
const { statsScrape } = require('./stats');
const { chartsScrape, processChartData } = require('./charts');
const { ranksScrape, processRanksData } = require('./ranks');
const { getRatingDetail } = require('./mmr');
const { getUpdates } = require('./updates');

handleAllProfileData = async (res, name) => {
    const profile = await scrape(`https://rocketleague.tracker.network/profile/ps/${name}`, 'body', {
        stats: statsScrape,
        charts: chartsScrape,
        ranks: ranksScrape
    });

    res.json({
        stats: profile.stats,
        charts: processChartData(profile.charts),
        ranks: processRanksData(profile.ranks),
        mmr: await getRatingDetail(name),
        updates: await getUpdates(name)
    });
}

module.exports = {
    handleAllProfileData
}