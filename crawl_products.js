const fs = require('fs');
const Crawler = require('crawler');
const { PRODUCT_SOURCES } = require('./config');

function getSourceFilePath(source_link) {
    let file_name = source_link.split(/(\\|\/)/g).pop().split('.').shift();
    let file_path = `./data/product_sources/${file_name}.json`;
    return file_path;
}

function findProductLinksFromSource(source_link) {
    let products = [];
    let file_path = getSourceFilePath(source_link);
    console.log(file_path);
    let existed_data = null;
    try {
        existed_data = require(file_path);
    } catch (error) { console.log('existed data not found -> try to download') }
    if (existed_data) { console.log('existed data found -> skip'); return; }

    let crawler = new Crawler({
        maxConnections: 18,
        callback: function (error, res, done) {
            if (error) {
                console.log(error);
            }
            done();
        }
    });

    return new Promise((resolve, reject) => {
        crawler.direct({
            uri: source_link,
            callback: async function (error, res) {
                if (error) {
                    console.log(error);
                    return reject(false);
                }
                let $ = res.$;
                $('loc').toArray().forEach(elem => {
                    products.push({
                        link: elem.firstChild.data
                    })
                })
                let json = JSON.stringify(products);
                await fs.writeFile(file_path, json, (err) => {
                    if (err) {
                        console.error(err)
                        throw err
                    }
                    console.log(`Saved ${products.length} items to '${file_path}'`);
                    resolve(true);
                })
            }
        })
    });
}

function getProductsData(source_link) {
    return new Promise((resolve, reject) => {
        let file_path = getSourceFilePath(source_link);
        console.log('crawling data for: ', file_path);
        console.log('please wait ...')
        let products = [];
        try {
            products = require(file_path);
        } catch (error) { console.log('existed data not found') }

        if(products[0].title) {
            console.log('existed data found -> skip');
            resolve(true);
            return;
        }

        let product_crawler = new Crawler({
            maxConnections: 30,
            callback: function (error, res, done) {
                if (error) {
                    console.log(error);
                }
                done();
            }
        });
        const queues = [];
        for (let i = 0; i < products.length; i++) {
            let product = products[i]
            queues.push({
                uri: product.link,
                callback: async function (error, res, done) {
                    if (error) {
                        console.log(error);
                        return reject(false);
                    }
                    let $ = res.$;
                    product.title = $('.product_title.entry-title').first().text();
                    product.short_description = $('.woocommerce-product-details__short-description p').html();
                    product.price = $('.woocommerce-Price-amount.amount bdi').text();
                    product.long_description = $('.woocommerce-Price-amount.amount bdi').text();
                    product.long_description = $('#tab-description p').html();
                    product.image_main = $('.woocommerce-product-gallery__image.woocommerce-main-image img').attr('src');
                    product.image_gallery = $('.woocommerce-product-gallery__image img').toArray().map(img => {
                        return img.attribs.src;
                    });
                    console.log('done: ', product.link);
                    done();
                }
            })
        }
        product_crawler.queue(queues);
    
        product_crawler.on('drain', async function() {
            console.log('test');
            let json = JSON.stringify(products);
            await fs.writeFile(file_path, json, (err) => {
                if (err) {
                    console.error(err)
                    throw err
                }
                console.log(`Saved ${products.length} items to '${file_path}'`);
                resolve(true);
            })
        })
    });
}
async function getAllProductLinks() {
    for (const source_link of PRODUCT_SOURCES) {
        await findProductLinksFromSource(source_link);
    }
}

async function getAllProductsData() {
    for (const source_link of PRODUCT_SOURCES) {
        await getProductsData(source_link);
    }
}


async function run() {
    await getAllProductLinks();
    await getAllProductsData();
}
module.exports = run;


