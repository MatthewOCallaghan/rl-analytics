const xray = require('x-ray');
const { getIds } = require('./steam-username');

const PLATFORMS = ['ps', 'xbox', 'steam'];

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

handleScrapingRequest = async (res, name, platform, fcn) => {
    var platforms = PLATFORMS;
    if (platform) {
        if(!PLATFORMS.includes(platform)) {
            res.status(400).json("Platform must be 'ps', 'steam' or 'xbox'");
        } else {
            platforms = [platform];
        }
    }    

    for (let i = 0; i < platforms.length; i++) {
        const p = platforms[i];
        try {
            const data = await getPlatformData(name, p, fcn);
            if (data !== null) {
                res.json([data]);
                return;
            }
        } catch(error) {
            console.log(error);
        }
    };

    res.json([]);
}

getPlatformData = async (name, platform, fcn) => {
    try {

        const isValid = data => data && !(Array.isArray(data) && data.length === 0 || Object.keys(data).length === 0);

        if (platform === 'steam') {
            const ids = await getIds(name.replace('%20', ' '));
            const steamUsers = (await Promise.all(ids.map(id => fcn(id, 'steam')))).filter(user => isValid(user));
            return steamUsers.length > 0 ? { platform, data: steamUsers[0] } : null;
        }


        const data = await fcn(name, platform);
        return isValid(data) ? {platform, data} : null;

    } catch(error) {
        console.log(error);
        return null;
    }
}

module.exports = {
    scrape,
    handleScrapingRequest,
    getPlatformData,
    PLATFORMS
};