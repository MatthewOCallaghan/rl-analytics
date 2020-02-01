const scrape = require('./scrape');
const { statsScrape } = require('./stats');
const { chartsScrape } = require('./charts');

combined = (res, name) => {
    scrape(`https://rocketleague.tracker.network/profile/ps/${name}`, 'body', {
        stats: statsScrape,
        chart: chartsScrape
    })
        .then(data => {
            // data.chart = processChartData(data.chart);
            return data;
        })
        .then(data => res.json(data));
}

module.exports = {
    combined
}