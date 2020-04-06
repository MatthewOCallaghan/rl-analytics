const Nightmare = require('nightmare');
const xray = require('x-ray');
const scrape = xray({
    filters: {
        extractId: url => {
            const REGEX = /^https:\/\/steamcommunity\.com\/profiles\/(\d+)$/;
            const match = url.match(REGEX);
            return match ? match[1] : undefined;
        }
    }
});


const getIds = async name => {
    const nightmare = Nightmare({ waitTimeout: 5000 });

    try {
        const data = await new Promise((resolve, reject) => {
            nightmare.goto(`https://steamcommunity.com/search/users/#text=${name}`)
                .wait('.searchPersonaName')
                .evaluate(() => document.querySelector('body').outerHTML)
                .end()
                .then(response => {
                    scrape(response, '#search_results', scrape('a.searchPersonaName', [{ name: '@html', id: '@href | extractId'}]))((err, results) => {
                        if (err) reject(err);
                        resolve(results.filter(result => result.name === name && result.id).map(result => result.id));
                    })
                })
                .catch(err => reject(err));
        })
    
        return data;
    } catch (err) {
        return [];
    }
        
}

module.exports = {
    getIds
};