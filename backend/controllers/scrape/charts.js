const toObject = require('convert-to-object');

const { scrape } = require('./scrape');

const chartsScrape = scrape('.content-container div', ['script | chartData']);

getChartData = async (name, platform) => {
    return await scrape(`https://rocketleague.tracker.network/profile/${platform}/${name}`, 'body', chartsScrape)
        .then(processChartData);
}

const processChartData = data => {
    data = data.filter(script => script !== null)
                .map(script => script.trim().split(`$('#`).slice(1))
                .reduce((acc, val) => acc.concat(val), []);
    return chartCodeArrayToObject(data);
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

module.exports = {
    chartsScrape,
    getChartData,
    processChartData
}