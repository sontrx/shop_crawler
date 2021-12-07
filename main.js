const crawlProducts = require('./crawl_products');
const convertProducts = require('./convert_products');

async function run() {
    await crawlProducts();
    await convertProducts();
}

run();