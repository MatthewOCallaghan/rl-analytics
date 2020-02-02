const { scrape, handleScrapingRequest, PLATFORMS } = require('./scrape');
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

handleGetAllProfileData = async (res, name, platform) => {
    if (platform) {
        await handleScrapingRequest(res, name, platform, getAllProfileData);
    } else {
        res.json(await getAllProfileDataForEachPlatform(name));
    }
}

getAllProfileDataForEachPlatform = async name => {
    const getData = async (name, platform) => {
        const profile = await scrape(`https://rocketleague.tracker.network/profile/${platform}/${name}`, 'body', {
            stats: statsScrape,
            charts: chartsScrape,
            ranks: ranksScrape
        });
        if (profile.stats.length > 0) {
            return {
                platform,
                data: {
                    stats: profile.stats,
                    charts: processChartData(profile.charts),
                    ranks: processRanksData(profile.ranks),
                    mmr: await getRatingDetail(name, platform),
                    updates: await getUpdates(name, platform)
                }
            };
        }
        return {platform, data: {}};
    }

    return await Promise.all(PLATFORMS.map(platform => getData(name, platform)));
}

module.exports = {
    handleGetAllProfileData
}