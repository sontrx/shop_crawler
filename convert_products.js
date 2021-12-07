const fs = require('fs');
const Excel = require('exceljs');
const { PRODUCT_SOURCES } = require('./config');
function getSourceFilePath(source_link) {
    let file_name = source_link.split(/(\\|\/)/g).pop().split('.').shift();
    let file_path = `./data/product_sources/${file_name}.json`;
    return file_path;
}

function getConvertedFilePath(source_link) {
    let file_name = source_link.split(/(\\|\/)/g).pop().split('.').shift();
    let file_path = `./data/converted_products/${file_name}.csv`;
    return file_path;
}

async function saveConvertedProducts(products, file_path) {
    console.log(`Saved data to file ${file_path}`);

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Default");

    worksheet.columns = [
        { header: 'Handle', key: 'handle' },
        { header: 'Title', key: 'title' },
        { header: 'Body (HTML)', key: 'body' },
        { header: 'Vendor', key: 'vendor' },
        { header: 'Standard Product Type', key: 'unknown' },
        { header: 'Custom Product Type', key: 'unknown' },
        { header: 'Tags', key: 'unknown' },
        { header: 'Published', key: 'published' },
        { header: 'Option1 Name', key: 'unknown' },
        { header: 'Option1 Value', key: 'unknown' },
        { header: 'Option2 Name', key: 'unknown' },
        { header: 'Option2 Value', key: 'unknown' },
        { header: 'Option3 Name', key: 'unknown' },
        { header: 'Option3 Value', key: 'unknown' },
        { header: 'Variant SKU', key: 'unknown' },
        { header: 'Variant Grams', key: 'unknown' },
        { header: 'Variant Inventory Tracker', key: 'unknown' },
        { header: 'Variant Inventory Qty', key: 'unknown' },
        { header: 'Variant Inventory Policy', key: 'inventory_policy' },
        { header: 'Variant Fulfillment Service', key: 'fulfillment_service' },
        { header: 'Variant Price', key: 'price' },
        { header: 'Variant Compare At Price', key: 'price' },
        { header: 'Variant Requires Shipping', key: 'required_shipping' },
        { header: 'Variant Taxable', key: 'taxable' },
        { header: 'Variant Barcode', key: 'unknown' },
        { header: 'Image Src', key: 'image' },
        { header: 'Image Position', key: 'image_position' },
        { header: 'Image Alt Text', key: 'unknown' },
        { header: 'Gift Card', key: 'gift_card' },
        { header: 'SEO Title', key: 'unknown' },
        { header: 'SEO Description', key: 'unknown' },
        { header: 'Google Shopping / Google Product Category', key: 'unknown' },
        { header: 'Google Shopping / Gender', key: 'unknown' },
        { header: 'Google Shopping / Age Group', key: 'unknown' },
        { header: 'Google Shopping / MPN', key: 'unknown' },
        { header: 'Google Shopping / AdWords Grouping', key: 'unknown' },
        { header: 'Google Shopping / AdWords Labels', key: 'unknown' },
        { header: 'Google Shopping / Condition', key: 'unknown' },
        { header: 'Google Shopping / Custom Product', key: 'unknown' },
        { header: 'Google Shopping / Custom Label 0', key: 'unknown' },
        { header: 'Google Shopping / Custom Label 1', key: 'unknown' },
        { header: 'Google Shopping / Custom Label 2', key: 'unknown' },
        { header: 'Google Shopping / Custom Label 3', key: 'unknown' },
        { header: 'Google Shopping / Custom Label 4', key: 'unknown' },
        { header: 'Variant Image', key: 'unknown' },
        { header: 'Variant Weight Unit', key: 'unknown' },
        { header: 'Variant Tax Code', key: 'unknown' },
        { header: 'Cost per item', key: 'unknown' },
        { header: 'Status', key: 'status' },
        // { header: 'Tags', key: 'unknown' },
    ];

    worksheet.addRows(products);
    await workbook.csv.writeFile(file_path, {});
}


async function convertProducts(source_link) {
    let source_file_path = getSourceFilePath(source_link);
    let converted_file_path = getConvertedFilePath(source_link);
    let products = [];
    try {
        products = require(source_file_path);
    } catch (error) { console.log('existed data not found') }
    let converted_products = [];

    products.forEach(product => {
        product.image_gallery.forEach((image, index) => {
            converted_products.push({
                handle: product.link.split('/').slice(-2)[0],
                title: index === 0 ? product.title : '',
                body: index === 0 ? product.long_description : '',
                vendor: index === 0 ? 'Imported' : '',
                published: index === 0 ? true : '',
                price: index === 0 ? product.price.slice(0, -1) : '',
                image: image,
                image_position: index + 1,
                required_shipping: index === 0 ? false : '',
                taxable: index === 0 ? false : '',
                gift_card: index === 0 ? false : '',
                status: index === 0 ? 'active' : '',
                inventory_policy: index === 0 ? 'deny' : '',
                fulfillment_service: index === 0 ? 'manual' : '',
                unknown: '',
            })
        })
    })
    await saveConvertedProducts(converted_products, converted_file_path);
}

async function run() {
    console.log('start convert products');
    for (const source_link of PRODUCT_SOURCES) {
        await convertProducts(source_link);
    }
}
module.exports = run;
