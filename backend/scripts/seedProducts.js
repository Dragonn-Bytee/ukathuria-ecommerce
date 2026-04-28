import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

import Product from '../models/Product.js';
import User from '../models/User.js';

// Build an image object with the required publicId field
const i = (photoId, slug) => ({
  url: `https://images.unsplash.com/photo-${photoId}?w=600&q=80`,
  publicId: `seed/${slug}`,
});

const ts = () => Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) { console.error('❌ No admin. Run /api/setup-admin first.'); process.exit(1); }
  const uid = admin._id;

  const products = [
    // ── Electronics ─────────────────────────────────────────────────────────
    { name:'AirPods Pro Max',          category:'electronics', brand:'Apple',      price:549,  description:'Premium over-ear headphones with spatial audio and ANC.',             images:[i('1505740420928-5e560c06d30e','airpods-pro-max')] },
    { name:'Sony WH-1000XM5',          category:'electronics', brand:'Sony',       price:349,  description:'Industry-leading noise cancelling wireless headphones.',               images:[i('1546435770-a3e426bf472b','sony-wh1000xm5')] },
    { name:'Samsung Galaxy S24 Ultra', category:'electronics', brand:'Samsung',    price:1299, description:'Flagship Android phone with 200MP camera and S Pen.',                 images:[i('1511707171634-5f897ff02aa9','samsung-galaxy-s24')] },
    { name:'iPad Pro 12.9in',          category:'electronics', brand:'Apple',      price:1099, description:'M2 chip, Liquid Retina XDR display, Thunderbolt connectivity.',       images:[i('1544244015-0df4b3ffc6b0','ipad-pro')] },
    { name:'MacBook Air M3',           category:'electronics', brand:'Apple',      price:1299, description:'Impossibly thin laptop with all-day battery and M3 chip.',            images:[i('1517336714731-489689fd1ca8','macbook-air-m3')] },
    { name:'Dell XPS 15',              category:'electronics', brand:'Dell',       price:1899, description:'15.6 inch OLED display, Core i9, premium build quality.',             images:[i('1593642632559-0c6d3fc62b89','dell-xps-15')] },
    { name:'LG 27in 4K Monitor',       category:'electronics', brand:'LG',         price:449,  description:'IPS 4K UHD monitor with HDR600 and USB-C connectivity.',             images:[i('1527443224154-c4a3942d3acf','lg-monitor-4k')] },
    { name:'Logitech MX Master 3',     category:'electronics', brand:'Logitech',   price:99,   description:'Advanced wireless mouse for power users with ergonomic design.',      images:[i('1615663245857-ac93bb7c39e7','logitech-mx-master')] },
    { name:'Keychron K2 Keyboard',     category:'electronics', brand:'Keychron',   price:89,   description:'Wireless mechanical keyboard with RGB and hot-swap switches.',        images:[i('1587829741301-dc798b83add3','keychron-k2')] },
    { name:'GoPro Hero 12',            category:'electronics', brand:'GoPro',      price:399,  description:'5.3K60 video, HyperSmooth 6.0, waterproof action camera.',           images:[i('1516035069371-29a1b244cc32','gopro-hero12')] },
    { name:'Nintendo Switch OLED',     category:'electronics', brand:'Nintendo',   price:349,  description:'7 inch OLED screen, enhanced audio, 64GB storage.',                  images:[i('1578662996442-48f60103fc96','nintendo-switch-oled')] },
    { name:'Bose SoundLink Max',       category:'electronics', brand:'Bose',       price:399,  description:'Portable Bluetooth speaker with 20-hour battery life.',               images:[i('1608043152269-423dbba4e7e1','bose-soundlink-max')] },
    { name:'Apple Watch Ultra 2',      category:'electronics', brand:'Apple',      price:799,  description:'Rugged titanium case, dual-frequency GPS, 60-hour battery.',          images:[i('1546868871-7041f2a55e12','apple-watch-ultra2')] },
    { name:'Garmin Forerunner 965',    category:'electronics', brand:'Garmin',     price:599,  description:'Premium running smartwatch with AMOLED display and maps.',            images:[i('1523475496153-3206d90cbef0','garmin-forerunner')] },
    { name:'Anker 65W GaN Charger',    category:'electronics', brand:'Anker',      price:49,   description:'Compact 3-port fast charger for all your devices.',                   images:[i('1583863788434-e58a36330cf0','anker-gan-charger')] },
    { name:'Kindle Paperwhite',        category:'electronics', brand:'Amazon',     price:139,  description:'Thinner, lighter Kindle with 6.8 inch display and 10-week battery.', images:[i('1544716278-ca5e3f4abd8c','kindle-paperwhite')] },
    { name:'Portable SSD 1TB',         category:'electronics', brand:'Samsung',    price:119,  description:'USB-C portable SSD with 2000MB/s transfer speed, shock resistant.',   images:[i('1597872200969-2b65d56bd16b','samsung-portable-ssd')] },
    // ── Apparel ─────────────────────────────────────────────────────────────
    { name:'Classic White Tee',        category:'apparel',     brand:'AURA',       price:29,   description:'Premium 100 percent Pima cotton essential crew-neck t-shirt.',        images:[i('1521572163474-6864f9cf17ab','white-tee')] },
    { name:'Slim Fit Chinos',          category:'apparel',     brand:'Minimalist Co.', price:79, description:'Tailored slim fit chinos in stretch cotton blend.',                 images:[i('1473966968600-fa801b869a1a','slim-chinos')] },
    { name:'Merino Wool Sweater',      category:'apparel',     brand:'AURA',       price:129,  description:'Soft 100 percent merino wool crew-neck sweater for all seasons.',     images:[i('1620799140408-edc6dcb6d633','merino-sweater')] },
    { name:'Leather Biker Jacket',     category:'apparel',     brand:'Minimalist Co.', price:299, description:'Genuine leather moto jacket with asymmetric zip.',               images:[i('1551028719-00167b16eac5','leather-jacket')] },
    { name:'Linen Shirt',              category:'apparel',     brand:'AURA',       price:59,   description:'Breathable 100 percent linen shirt, perfect for warm weather.',       images:[i('1596755389378-c31d21fd1273','linen-shirt')] },
    { name:'Relaxed Denim Jeans',      category:'apparel',     brand:'Denim Lab',  price:99,   description:'Mid-rise relaxed fit selvedge denim, raw indigo wash.',               images:[i('1542272604-787c3835535d','denim-jeans')] },
    { name:'Fleece Hoodie',            category:'apparel',     brand:'AURA',       price:69,   description:'Heavyweight French terry fleece pullover hoodie.',                    images:[i('1556821840-3a63f15732ce','fleece-hoodie')] },
    { name:'Oxford Button-Down',       category:'apparel',     brand:'Minimalist Co.', price:89, description:'Classic Oxford weave button-down shirt in 100 percent cotton.',    images:[i('1603251578711-3290ca1a0187','oxford-shirt')] },
    { name:'Cargo Shorts',             category:'apparel',     brand:'Denim Lab',  price:55,   description:'Utility cargo shorts with 6 pockets and ripstop nylon fabric.',      images:[i('1591195853828-11db59a44f43','cargo-shorts')] },
    { name:'Trench Coat',              category:'apparel',     brand:'AURA',       price:349,  description:'Classic double-breasted trench coat in water-repellent cotton.',      images:[i('1539533018447-63fcce2678e3','trench-coat')] },
    { name:'Athletic Joggers',         category:'apparel',     brand:'SportPro',   price:65,   description:'4-way stretch performance joggers with tapered fit.',                 images:[i('1506629082955-511b1aa562c8','joggers')] },
    { name:'Polo Shirt',               category:'apparel',     brand:'Minimalist Co.', price:75, description:'Pique cotton polo shirt with contrast tipping.',                   images:[i('1576566588028-4147f3842f27','polo-shirt')] },
    { name:'Bomber Jacket',            category:'apparel',     brand:'AURA',       price:199,  description:'Satin bomber jacket with ribbed cuffs, collar, and hem.',             images:[i('1520975954732-35dd22299614','bomber-jacket')] },
    // ── Accessories ─────────────────────────────────────────────────────────
    { name:'Leather Bifold Wallet',    category:'accessories', brand:'AURA',       price:89,   description:'Full-grain leather slim bifold wallet with RFID blocking.',           images:[i('1548036328-c9fa89d128fa','leather-wallet')] },
    { name:'Canvas Tote Bag',          category:'accessories', brand:'Minimalist Co.', price:45, description:'Heavy-duty waxed canvas tote with leather handles.',               images:[i('1590874103328-eac38a683ce7','canvas-tote')] },
    { name:'Aviator Sunglasses',       category:'accessories', brand:'OptixPro',   price:149,  description:'Classic metal aviator sunglasses with UV400 polarized lenses.',      images:[i('1511499767150-a48a237f0083','aviator-sunglasses')] },
    { name:'Leather Belt',             category:'accessories', brand:'AURA',       price:69,   description:'Full-grain leather reversible belt, black and tan sides.',            images:[i('1624222247344-550fb60583dc','leather-belt')] },
    { name:'Wool Beanie',              category:'accessories', brand:'AURA',       price:35,   description:'100 percent merino wool rib-knit beanie in a relaxed slouchy fit.',  images:[i('1576871337622-98d48d1cf531','wool-beanie')] },
    { name:'Silk Pocket Square',       category:'accessories', brand:'Minimalist Co.', price:29, description:'100 percent silk pocket square with hand-rolled edges.',           images:[i('1602810318383-e386cc2a3ccf','silk-pocket-square')] },
    { name:'Leather Backpack',         category:'accessories', brand:'AURA',       price:229,  description:'Full-grain leather rucksack with 15 inch laptop compartment.',       images:[i('1553062407-98eeb64c6a62','leather-backpack')] },
    { name:'Minimalist Watch',         category:'accessories', brand:'Nordgreen',  price:195,  description:'Danish-designed watch with sapphire crystal and mesh strap.',        images:[i('1523275335684-37898b6baf30','minimalist-watch')] },
    { name:'Cashmere Scarf',           category:'accessories', brand:'AURA',       price:119,  description:'Pure Scottish cashmere scarf, hand-finished fringe detailing.',      images:[i('1601924351433-3d7526065dbd','cashmere-scarf')] },
    { name:'Weekender Bag',            category:'accessories', brand:'AURA',       price:189,  description:'Waxed canvas weekender bag with leather trim and shoe pocket.',      images:[i('1473188588951-666fce8e7c68','weekender-bag')] },
    { name:'Leather Card Holder',      category:'accessories', brand:'Minimalist Co.', price:49, description:'Ultra-slim genuine leather card holder with 6 card slots.',       images:[i('1627123424574-724758594e93','card-holder')] },
    { name:'Aviator Watch',            category:'accessories', brand:'OptixPro',   price:275,  description:'Military-inspired chronograph watch with Swiss movement.',           images:[i('1614164185128-e4ec99c436d7','aviator-watch')] },
    // ── Footwear ────────────────────────────────────────────────────────────
    { name:'White Leather Sneakers',   category:'footwear',    brand:'AURA',       price:149,  description:'Clean minimal white leather low-top sneakers with cupsole.',         images:[i('1542291026-7eec264c27ff','white-sneakers')] },
    { name:'Chelsea Boots',            category:'footwear',    brand:'Minimalist Co.', price:249, description:'Suede Chelsea boots with elastic side panels and stacked heel.',  images:[i('1608256246200-53e635b5b65f','chelsea-boots')] },
    { name:'Running Shoes',            category:'footwear',    brand:'SportPro',   price:129,  description:'Lightweight mesh runners with foam midsole and rubber outsole.',     images:[i('1460353581641-37baddab0fa2','running-shoes')] },
    { name:'Desert Boots',             category:'footwear',    brand:'AURA',       price:179,  description:'Natural suede crepe sole desert boots, classic silhouette.',         images:[i('1638247025967-b4e38f787b76','desert-boots')] },
    { name:'Leather Loafers',          category:'footwear',    brand:'Minimalist Co.', price:199, description:'Hand-sewn leather penny loafers with leather sole.',              images:[i('1614252235316-8c857d38b5f4','leather-loafers')] },
    { name:'High-Top Sneakers',        category:'footwear',    brand:'Denim Lab',  price:109,  description:'Canvas high-top sneakers with vulcanized rubber sole.',              images:[i('1514989940723-e8e51635b782','high-top-sneakers')] },
    { name:'Leather Sandals',          category:'footwear',    brand:'AURA',       price:79,   description:'Full-grain leather sandals with adjustable straps and cork footbed.',images:[i('1603487742131-4160ec999306','leather-sandals')] },
    // ── Home ────────────────────────────────────────────────────────────────
    { name:'Linen Duvet Cover',        category:'home',        brand:'AURA Home',  price:149,  description:'100 percent stonewashed linen duvet cover set in natural oatmeal.', images:[i('1631049307264-da0ec9d70304','linen-duvet')] },
    { name:'Scented Candle Set',       category:'home',        brand:'Luminary',   price:65,   description:'Set of 3 soy wax candles: cedar, sandalwood and vetiver scents.',   images:[i('1603905185787-4cd35d75a275','scented-candles')] },
    { name:'Ceramic Pour-Over Set',    category:'home',        brand:'AURA Home',  price:89,   description:'Hand-thrown ceramic pour-over coffee dripper with matching mug.',    images:[i('1495474472287-4d71bcdd2085','pour-over-coffee')] },
    // ── Appliances ──────────────────────────────────────────────────────────
    { name:'Smart Refrigerator',      category:'appliances',  brand:'Samsung',    price:2499, description:'Bespoke 4-Door Flex refrigerator with Family Hub and AI Vision.',     images:[i('1584622650065-430c30981977','smart-fridge')] },
    { name:'Convection Oven',          category:'appliances',  brand:'LG',         price:899,  description:'ProBake Convection slide-in electric range with Air Fry.',           images:[i('1585532822180-2a07525381d5','convection-oven')] },
    { name:'Quiet Dishwasher',         category:'appliances',  brand:'Bosch',      price:1099, description:'800 Series dishwasher with CrystalDry technology.',                  images:[i('1584622650131-9992a70747a7','dishwasher')] },
    { name:'Front Load Washer',        category:'appliances',  brand:'Samsung',    price:949,  description:'Super Speed Wash front load washer with AI Smart Dial.',            images:[i('1584622650221-a4b50f75727a','washer')] },
  ];

  // Update categories to match Home page
  products.forEach(p => {
    if (p.category === 'apparel') p.category = 'fashion';
    if (p.category === 'footwear') p.category = 'fashion';
    if (p.category === 'accessories') p.category = 'beauty';
  });

  let created = 0, skipped = 0;
  for (const p of products) {
    const exists = await Product.findOne({ name: p.name });
    if (exists) { skipped++; continue; }
    await Product.create({
      ...p,
      sku: ts(),
      status: 'active',
      featured: Math.random() > 0.7,
      rating: +(4 + Math.random()).toFixed(1),
      inventory: { quantity: Math.floor(Math.random() * 200) + 10, trackQuantity: true },
      createdBy: uid,
    });
    created++;
    process.stdout.write(`\r  ✓ ${created} products created...`);
  }

  console.log(`\n\n✅ Done! Created: ${created} | Already existed: ${skipped}`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(e => { console.error('\n❌', e.message); process.exit(1); });
