const scrape = require('./scrape');

const updatesScrape = {
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
};

getUpdates = (res, name) => {
    scrape(`https://rocketleague.tracker.network/profile/updates/ps/${name}`, '.profile-main', updatesScrape)
        .then(processUpdatesData)
        .then(data => res.json(data));
}

const processUpdatesData = data => {
    return data.updates.filter(update => update.stats.length > 0)
                        .map((update, index) => {
                            update.time = data.times[index].time;
                            return update;
                        });
}

module.exports = {
    updatesScrape,
    getUpdates,
    processUpdatesData
}