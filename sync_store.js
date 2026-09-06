/**
 * Naomika Design Studio - Catalog Auto-Sync Engine
 * Reads products.xlsx and syncs into data/products.json and data/products.js
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const BASE_DIR = __dirname;
const XLSX_FILE = path.join(BASE_DIR, 'products.xlsx');
const CSV_FILE = path.join(BASE_DIR, 'products.csv');
const RAW_IMG_DIR = path.join(BASE_DIR, 'raw_images');
const OUTPUT_IMG_DIR = path.join(BASE_DIR, 'images');
const DATA_DIR = path.join(BASE_DIR, 'data');
const JSON_FILE = path.join(DATA_DIR, 'products.json');
const JS_FILE = path.join(DATA_DIR, 'products.js');

function ensureDirectories() {
    if (!fs.existsSync(RAW_IMG_DIR)) fs.mkdirSync(RAW_IMG_DIR, { recursive: true });
    if (!fs.existsSync(OUTPUT_IMG_DIR)) fs.mkdirSync(OUTPUT_IMG_DIR, { recursive: true });
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function resolveImagePath(rawName) {
    if (!rawName) return 'images/1.jpeg';
    const strName = String(rawName).trim();
    if (!strName) return 'images/1.jpeg';

    const cleanName = strName.replace(/^\.?\//, '').replace(/^images\//, '');
    const nameNoExt = path.parse(cleanName).name;

    if (fs.existsSync(OUTPUT_IMG_DIR)) {
        const allFiles = fs.readdirSync(OUTPUT_IMG_DIR);
        const matched = allFiles.find(f => {
            const fNoExt = path.parse(f).name;
            return f.toLowerCase() === cleanName.toLowerCase() || fNoExt.toLowerCase() === nameNoExt.toLowerCase();
        });
        if (matched) return `images/${matched}`;
    }

    // Check if file exists in raw_images and copy
    const rawFilePath = path.join(RAW_IMG_DIR, cleanName);
    if (fs.existsSync(rawFilePath)) {
        const destPath = path.join(OUTPUT_IMG_DIR, cleanName);
        if (!fs.existsSync(destPath)) {
            fs.copyFileSync(rawFilePath, destPath);
        }
        return `images/${cleanName}`;
    }

    return `images/${cleanName}`;
}

let globalProductCodeCounter = 200;

function generateProductCode() {
    globalProductCodeCounter++;
    return `P${globalProductCodeCounter}`;
}

function syncStore() {
    console.log('--- Naomika Design Studio Catalog Sync ---');
    ensureDirectories();

    let rows = [];
    if (fs.existsSync(XLSX_FILE)) {
        console.log(`[1/3] Reading spreadsheet: ${XLSX_FILE}`);
        const wb = XLSX.readFile(XLSX_FILE);
        const firstSheet = wb.SheetNames[0];
        rows = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet]);
    } else if (fs.existsSync(CSV_FILE)) {
        console.log(`[1/3] Reading CSV: ${CSV_FILE}`);
        const wb = XLSX.readFile(CSV_FILE);
        const firstSheet = wb.SheetNames[0];
        rows = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet]);
    } else {
        console.error('Error: Neither products.xlsx nor products.csv found in workspace!');
        process.exit(1);
    }

    const products = [];
    globalProductCodeCounter = 200;

    rows.forEach((row, idx) => {
        const category = String(row['Category'] || 'Ladies Wear').trim();
        let code = row['Product Code'] ? String(row['Product Code']).trim() : '';
        if (!code) {
            code = generateProductCode();
        } else {
            const numMatch = code.match(/^P-?(\d+)$/i);
            if (numMatch) {
                const n = parseInt(numMatch[1], 10);
                if (n > globalProductCodeCounter) globalProductCodeCounter = n;
            }
        }

        const name = String(row['Product Name'] || `Studio Creation ${idx + 1}`).trim();
        const rawPrice = row['Price'] !== undefined ? row['Price'] : 0;
        const priceNum = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice).replace(/[^\d.]/g, '')) || 0;
        const origPrice = row['Original Price'] ? (typeof row['Original Price'] === 'number' ? row['Original Price'] : parseFloat(String(row['Original Price']).replace(/[^\d.]/g, '')) || 0) : 0;

        const img1 = resolveImagePath(row['Image 1'] || row['Image'] || '');
        const img2 = row['Image 2'] ? resolveImagePath(row['Image 2']) : '';
        const img3 = row['Image 3'] ? resolveImagePath(row['Image 3']) : '';

        const images = [img1];
        if (img2 && img2 !== img1) images.push(img2);
        if (img3 && !images.includes(img3)) images.push(img3);

        const stock = String(row['Stock Status'] || 'In Stock').trim();
        const badge = String(row['Badge'] || row['Tagline'] || 'Fresh Arrivals').trim();
        const desc = String(row['Description'] || 'Handcrafted designer creation by Naomika Design Studio. Bespoke cut, premium fabric, and master craftsmanship.').trim();
        const featured = String(row['Featured'] || 'No').trim().toLowerCase() === 'yes';

        products.push({
            id: idx + 1,
            code,
            name,
            category,
            price: priceNum,
            priceDisplay: priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'Bespoke / On Request',
            originalPrice: origPrice,
            originalPriceDisplay: origPrice > 0 ? `₹${origPrice.toLocaleString('en-IN')}` : '',
            image: img1,
            image2: img2 || img1,
            image3: img3 || img1,
            images: images,
            stockStatus: stock,
            badge: badge,
            tagline: badge,
            description: desc,
            featured
        });
    });

    console.log(`[2/3] Processed ${products.length} catalog products.`);

    // Write JSON file
    fs.writeFileSync(JSON_FILE, JSON.stringify(products, null, 2), 'utf8');

    // Write JS bundle for instant offline/static load
    const jsContent = `/**
 * Auto-generated by Naomika Design Studio Sync Engine
 * Generated: ${new Date().toISOString()}
 * Total Products: ${products.length}
 */
window.STUDIO_PRODUCTS = ${JSON.stringify(products, null, 2)};
`;
    fs.writeFileSync(JS_FILE, jsContent, 'utf8');

    console.log(`[3/3] Successfully generated:`);
    console.log(`  -> ${JSON_FILE}`);
    console.log(`  -> ${JS_FILE}`);
    console.log('Catalog sync complete!\n');
}

syncStore();
