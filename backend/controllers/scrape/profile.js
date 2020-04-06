const { scrape, handleScrapingRequest, getPlatformData, PLATFORMS } = require('./scrape');
const { statsScrape } = require('./stats');
const { chartsScrape, processChartData } = require('./charts');
const { ranksScrape, processRanksData } = require('./ranks');
const { getRatingDetail } = require('./mmr');
const { getUpdates } = require('./updates');

getAllProfileData = async (name, platform) => {
    const profile = await scrape(`https://rocketleague.tracker.network/profile/${platform}/${name}`, 'body', {
        stats: statsScrape,
        charts: chartsScrape,
        ranks: ranksScrape
    });

    return {
        stats: profile.stats,
        charts: processChartData(profile.charts),
        ranks: processRanksData(profile.ranks),
        mmr: await getRatingDetail(name, platform),
        updates: await getUpdates(name, platform)
    };
}

handleGetAllProfileData = (res, name, platform) => handleScrapingRequest(res, name, platform, platform ? getAllProfileData : getAllProfileDataForUnknownPlatform);

getAllProfileDataForUnknownPlatform = async (name, platform) => {
    const profile = await scrape(`https://rocketleague.tracker.network/profile/${platform}/${name}`, 'body', {
        stats: statsScrape,
        charts: chartsScrape,
        ranks: ranksScrape
    });
    if (profile.stats.length > 0) {
        return {
            stats: profile.stats,
            charts: processChartData(profile.charts),
            ranks: processRanksData(profile.ranks),
            mmr: await getRatingDetail(name, platform),
            updates: await getUpdates(name, platform)
        };
    }
    return null;
}

module.exports = {
    handleGetAllProfileData
}