const xray = require('x-ray');

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

removeCommas = value => typeof value === 'string' ? value.replace(/,/g, '') : value;

removeNestedHTML = value => typeof value === 'string' ? value.replace(/<(.|\n)*>/g, '') : value;

module.exports = scrape;