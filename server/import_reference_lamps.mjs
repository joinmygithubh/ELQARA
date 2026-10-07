import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const slugs = [
  'sol', 'baluster', 'coil', 'hourglass', 'flute', 'stem',
  'terrace', 'meadow', 'gourd', 'chisel', 'bead', 'sentinel',
  'ripple', 'pebble'
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

console.log('=== STEP 1: Downloading 14 reference product images ===');

const clientPublicUploads = path.resolve(__dirname, '../client/public/uploads/products');
const serverUploads = path.resolve(__dirname, 'uploads/products');

const scrapedProducts = [];

for (const s of slugs) {
  console.log(`\nProcessing ${s}...`);
  const pdpUrl = `https://resplendent-sopapillas-325ee1.netlify.app/products/${s}-table-lamp/`;
  const html = await fetchText(pdpUrl);

  const titleMatch = html.match(/<h1 class="h1 pdp__title">([^<]+)<\/h1>/);
  const shortMatch = html.match(/<p class="pdp__short">([^<]+)<\/p>/);
  const priceMatch = html.match(/data-pid="([^"]+)"[^>]*>₹([0-9,]+)<\/span>/);
  const descMatch = html.match(/<p class="pdp__desc">([^<]+)<\/p>/);
  const matMatch = html.match(/<th>Materials<\/th><td>([^<]+(?:<br>[^<]+)*)<\/td>/);

  const name = (titleMatch ? titleMatch[1] : s).trim();
  const shortDesc = (shortMatch ? shortMatch[1] : '').trim();
  const rawPrice = priceMatch ? parseInt(priceMatch[2].replace(/,/g, ''), 10) : 9900;
  const sku = priceMatch ? priceMatch[1] : `INT-TL-${s.toUpperCase()}`;
  const desc = (descMatch ? descMatch[1] : '').trim();
  const materials = matMatch ? matMatch[1].replace(/<br>/g, ', ').trim() : 'Solid Wood & Fabric';

  // Image URLs on reference site
  const jpgUrl = `https://resplendent-sopapillas-325ee1.netlify.app/images/products/${s}/main.jpg`;
  const webpUrl = `https://resplendent-sopapillas-325ee1.netlify.app/images/products/${s}/main-full.webp`;

  // Destination paths
  const clientJpg = path.join(clientPublicUploads, s, 'main.jpg');
  const clientWebp = path.join(clientPublicUploads, s, 'main-full.webp');
  const serverJpg = path.join(serverUploads, s, 'main.jpg');
  const serverWebp = path.join(serverUploads, s, 'main-full.webp');

  const serverDir = path.dirname(serverJpg);
  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
  }

  console.log(`Downloading ${jpgUrl}...`);
  await downloadFile(jpgUrl, clientJpg);
  fs.copyFileSync(clientJpg, serverJpg);

  console.log(`Downloading ${webpUrl}...`);
  await downloadFile(webpUrl, clientWebp);
  fs.copyFileSync(clientWebp, serverWebp);

  const jpgSize = fs.statSync(clientJpg).size;
  const webpSize = fs.statSync(clientWebp).size;
  console.log(`  Saved ${s}/main.jpg (${jpgSize} bytes) & main-full.webp (${webpSize} bytes)`);

  scrapedProducts.push({
    slug: `${s}-table-lamp`,
    code: s,
    name: `${name} Table Lamp`,
    shortDescription: shortDesc,
    description: desc,
    price: rawPrice,
    mrp: Math.round(rawPrice * 1.35),
    sku: `ELQ-${sku}`,
    materials,
    thumbnail: `/uploads/products/${s}/main.jpg`,
    images: [
      `/uploads/products/${s}/main.jpg`,
      `/uploads/products/${s}/main-full.webp`
    ]
  });
}

console.log('\n=== STEP 2: Connecting to MongoDB to update ELQARA database ===');
await mongoose.connect(process.env.MONGO_URI);

const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

const tableLampsCategory = await Category.findOne({ slug: 'table-lamps' });
if (!tableLampsCategory) {
  throw new Error('Table Lamps category not found in DB!');
}
console.log('Found Table Lamps category:', tableLampsCategory._id.toString());

// Remove test item 'fejpoef' if it exists
await Product.deleteMany({ slug: 'fejpoef-745' });

// Featured and new arrival lists
const featuredSlugs = ['sol-table-lamp', 'coil-table-lamp', 'hourglass-table-lamp', 'terrace-table-lamp'];
const bestSellerSlugs = ['sol-table-lamp', 'baluster-table-lamp', 'hourglass-table-lamp', 'gourd-table-lamp'];
const newArrivalSlugs = ['sol-table-lamp', 'coil-table-lamp', 'flute-table-lamp', 'terrace-table-lamp', 'bead-table-lamp', 'pebble-table-lamp'];

for (const p of scrapedProducts) {
  const isFeatured = featuredSlugs.includes(p.slug);
  const isBestSeller = bestSellerSlugs.includes(p.slug);
  const isNewArrival = newArrivalSlugs.includes(p.slug);

  const productDoc = {
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    category: tableLampsCategory._id,
    categoryName: 'Table Lamps',
    subcategory: 'Handcrafted Wood',
    price: p.price,
    mrp: p.mrp,
    discount: Math.round(((p.mrp - p.price) / p.mrp) * 100),
    sku: p.sku,
    stock: 18,
    images: p.images,
    thumbnail: p.thumbnail,
    specifications: {
      material: p.materials,
      color: 'Natural Artisan Wood & Linen',
      dimensions: '32 cm x 32 cm x 46 cm',
      weight: '2.8 kg',
      bulbType: 'E27 Warm LED Filament (Included)',
      wattage: '8W Warm White (2700K)',
      voltage: '220V - 240V AC',
      warranty: '2 Years ELQARA Manufacturer Warranty'
    },
    tags: [
      'table lamp',
      'wooden lamp',
      'handcrafted',
      p.code,
      'artisan wood',
      'ambient lighting',
      'objects for living'
    ],
    featured: isFeatured,
    bestSeller: isBestSeller,
    newArrival: isNewArrival,
    status: 'active',
    ratings: { average: 4.9, count: 24 }
  };

  const updated = await Product.findOneAndUpdate(
    { slug: p.slug },
    { $set: productDoc },
    { upsert: true, new: true }
  );

  console.log(`Upserted [${updated._id}] "${updated.name}" (${updated.slug}) -> thumbnail: ${updated.thumbnail}`);
}

const totalInTableLamps = await Product.countDocuments({ category: tableLampsCategory._id });
console.log(`\nTotal products now in Table Lamps category: ${totalInTableLamps}`);

await mongoose.disconnect();
console.log('\n=== COMPLETE: All 14 reference product images and products successfully updated! ===');
