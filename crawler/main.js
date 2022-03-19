const PairCrawler = require('./bot/pair_crawler.js')
const DexCrawler = require('./bot/dex_crawler.js')

// if this flag is enable for pair crawler, the bot will continue to crawl the last stored token pair
var isContinueFromLastCheckpoint = false
if (process.argv.length >= 3) {
    if (process.argv[2] == 'cont') {
        isContinueFromLastCheckpoint = true
    }
}

PairCrawler(isContinueFromLastCheckpoint).then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);
