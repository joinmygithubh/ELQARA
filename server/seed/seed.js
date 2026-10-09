import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Homepage from '../models/Homepage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const redactUri = (uri) => (uri ? uri.replace(/:([^:@]+)@/, ':****@') : '');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/elqara_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to database:', redactUri(mongoUri));

    // Safeguards 9, 10, 11: Production Database Protection
    const isLocal = mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost');
    const isProduction = !isLocal || process.env.NODE_ENV === 'production';
    const forceReset = process.argv.includes('--force-destructive-reset') && process.env.ALLOW_PRODUCTION_RESET === 'true';

    if (isProduction && !forceReset) {
      console.log('----------------------------------------------------');
      console.log('[SAFEGUARD ACTIVE]: Remote/Production database detected.');
      console.log('[SAFEGUARD ACTIVE]: Destructive deleteMany() / dropDatabase() is DISABLED.');
      console.log('[SAFEGUARD ACTIVE]: Running in SAFE NON-DESTRUCTIVE SYNC mode (upsert missing items only).');
      console.log('----------------------------------------------------');
    } else {
      // Clear existing records for clean seed in local development
      await User.deleteMany({});
      await Category.deleteMany({});
      await Product.deleteMany({});
      await Order.deleteMany({});
      await Coupon.deleteMany({});
      await Homepage.deleteMany({});
      console.log('[Seed] Cleared existing records (clean dev seed)');
    }

    // 1. Seed/Verify Users
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@elqara.com').toLowerCase();
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      if (isProduction && !process.env.ADMIN_INITIAL_PASSWORD && !process.env.ADMIN_PASSWORD) {
        console.warn('[Seed Safeguard]: Admin user does not exist in production.');
        console.warn('[Seed Safeguard]: Skipping auto-creation to prevent default password vulnerability.');
        console.warn('[Seed Safeguard]: Please set ADMIN_INITIAL_PASSWORD or ADMIN_PASSWORD to initialize.');
      } else {
        const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || 'ElqaraAdmin@2026';
        adminUser = await User.create({
          name: 'ELQARA Administrator',
          email: adminEmail,
          password: initialPassword,
          phone: process.env.ADMIN_PHONE || '+91 98765 43210',
          role: 'admin'
        });
        console.log(`[Seed] Administrator account initialized for: ${adminEmail}`);
      }
    } else {
      console.log(`[Seed] Real administrator account preserved: ${adminEmail}`);
    }

    // Demo customer is strictly isolated to non-production environments
    let demoCustomer = null;
    if (!isProduction) {
      demoCustomer = await User.findOne({ email: 'arjun.sharma@example.com' });
      if (!demoCustomer) {
        demoCustomer = await User.create({
          name: 'Arjun Sharma',
          email: 'arjun.sharma@example.com',
          password: process.env.DEMO_CUSTOMER_PASSWORD || 'CustomerPass@123',
          phone: '+91 98111 22334',
          role: 'customer',
          addresses: [
            {
              fullName: 'Arjun Sharma',
              phone: '+91 98111 22334',
              street: 'Apartment 402, Magnolia Enclave, Sector 54',
              landmark: 'Near Golf Course Road',
              city: 'Gurugram',
              state: 'Haryana',
              pincode: '122002',
              isDefault: true
            }
          ]
        });
        console.log('[Seed (Dev Only)] Created local development customer: arjun.sharma@example.com');
      }
    }


    // 2. Seed All 15 Categories
    const categoriesData = [
      // Lighting Categories
      {
        name: 'Table Lamps',
        slug: 'table-lamps',
        description: 'Artisanal sculptural tabletop luminaires crafted in solid wood, blown glass, ceramic & aged brass.',
        image: '/uploads/prod-mushroom-wood.jpg',
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Floor Lamps',
        slug: 'floor-lamps',
        description: 'Statement freestanding architectural floor lamps designed for expansive, considered living spaces.',
        image: '/uploads/prod-arc-floor.jpg',
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Pendant Lights',
        slug: 'pendant-lights',
        description: 'Pleated washi paper, woven bamboo and hand-turned timber hanging pendants casting soothing ambient glow.',
        image: '/uploads/prod-pendant-woven.jpg',
        displayOrder: 3,
        isActive: true
      },
      {
        name: 'Wall Lights',
        slug: 'wall-lights',
        description: 'Minimalist brass and stone sconces providing halo backlighting and subtle textural depth to walls.',
        image: '/uploads/prod-brass-fluted.jpg',
        displayOrder: 4,
        isActive: true
      },
      {
        name: 'Desk Lamps',
        slug: 'desk-lamps',
        description: 'Precision task lighting balancing functional articulation with understated architectural elegance.',
        image: 'https://images.unsplash.com/photo-1580481077195-c3f91572911b?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 5,
        isActive: true
      },
      {
        name: 'Ceiling Lights',
        slug: 'ceiling-lights',
        description: 'Flush-mount and semi-flush architectural ceiling luminaires offering wide, calm overhead radiance.',
        image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 6,
        isActive: true
      },
      {
        name: 'Bedside Lamps',
        slug: 'bedside-lamps',
        description: 'Intimate low-glare luminaires engineered with warm dimming for restful evening sanctuaries.',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 7,
        isActive: true
      },
      {
        name: 'Decorative Lamps',
        slug: 'decorative-lamps',
        description: 'Sculptural conversation pieces that function as fine art objects by day and luminous accents by night.',
        image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 8,
        isActive: true
      },
      {
        name: 'LED Lighting',
        slug: 'led-lighting',
        description: 'High-CRI architectural linear bars and minimalist energy-efficient LED luminaires.',
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 9,
        isActive: true
      },
      {
        name: 'Smart Lighting',
        slug: 'smart-lighting',
        description: 'Subtle technology seamlessly integrated into organic materials with intuitive capacitive controls.',
        image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 10,
        isActive: true
      },
      // Related Home Decor Categories
      {
        name: 'Night Lights',
        slug: 'night-lights',
        description: 'Gentle low-lumen orientation lights in alabaster, porcelain, and warm diffused acrylic.',
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 11,
        isActive: true
      },
      {
        name: 'Ambient Lighting',
        slug: 'ambient-lighting',
        description: 'Atmospheric luminaires designed to dissolve harsh shadows and cultivate evening serenity.',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 12,
        isActive: true
      },
      {
        name: 'Candle Lamps',
        slug: 'candle-lamps',
        description: 'Electric flameless candle warmers that melt scented wax cleanly using targeted radiant warmth.',
        image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 13,
        isActive: true
      },
      {
        name: 'Lighting Accessories',
        slug: 'lighting-accessories',
        description: 'Vintage amber filament bulbs, braided cloth cords, dimmer modules, and artisanal hardware.',
        image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 14,
        isActive: true
      },
      {
        name: 'Home Decor',
        slug: 'home-decor',
        description: 'Handcrafted Sheesham wood vessels, stone bowls, and decorative curios created by master artisans.',
        image: '/uploads/prod-carved-vessel.jpg',
        displayOrder: 15,
        isActive: true
      }
    ];

    const catMap = {};
    if (isProduction && !forceReset) {
      let newlyAdded = 0;
      for (const inputCat of categoriesData) {
        let existing = await Category.findOne({ slug: inputCat.slug });
        if (!existing) {
          existing = await Category.create(inputCat);
          newlyAdded++;
        }
        catMap[inputCat.slug] = existing;
        catMap[existing.name] = existing;
      }
      console.log(`[Seed] Verified categories: ${newlyAdded} new added, ${categoriesData.length} available`);
    } else {
      const createdCategories = await Category.insertMany(categoriesData);
      categoriesData.forEach((inputCat, idx) => {
        const created = createdCategories[idx];
        catMap[inputCat.slug] = created;
        catMap[created.name] = created;
      });
      console.log(`[Seed] Created ${createdCategories.length} categories`);
    }

    // 3. Seed Realistic, Premium Products Catalog (46 Products)
    const productsData = [
      // ==========================================
      // TABLE LAMPS (Prompt 1-7)
      // ==========================================
      {
        name: "Sol Table Lamp",
        slug: "sol-table-lamp",
        shortDescription: "Ribbed round-base table lamp",
        description: "Sol takes its name from the way light gathers in its ribbed curves. A generous, rounded wooden base carries a clean fabric drum shade, and brass-tone fittings at the neck add a quiet note of metal.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 11900,
        mrp: 16065,
        discount: 26,
        sku: "ELQ-INT-TL-001",
        stock: 18,
        images: ["/uploads/products/sol/main.jpg","/uploads/products/sol/main-full.webp"],
        thumbnail: "/uploads/products/sol/main.jpg",
        specifications: {
          material: "Wood base with ribbed profile, Fabric drum shade, Brass-tone metal fittings",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","sol","artisan wood","ambient lighting","objects for living"],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Baluster Table Lamp",
        slug: "baluster-table-lamp",
        shortDescription: "Turned baluster table lamp",
        description: "A classic turned baluster on a square plinth, taken out of the traditional and into a modern room. The pale, natural finish keeps it light and easy to place; the clean white drum shade keeps it calm.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 9900,
        mrp: 13365,
        discount: 26,
        sku: "ELQ-INT-TL-002",
        stock: 18,
        images: ["/uploads/products/baluster/main.jpg","/uploads/products/baluster/main-full.webp"],
        thumbnail: "/uploads/products/baluster/main.jpg",
        specifications: {
          material: "Turned wooden base on square plinth, Fabric drum shade",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","baluster","artisan wood","ambient lighting","objects for living"],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Coil Table Lamp",
        slug: "coil-table-lamp",
        shortDescription: "Tall ribbed column with black shade",
        description: "Tight, evenly cut rings wrap a tall wooden column, topped with a black drum shade for graphic contrast. Coil is the most architectural piece in the collection — it holds its own on a sideboard or a wide console.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 12900,
        mrp: 17415,
        discount: 26,
        sku: "ELQ-INT-TL-003",
        stock: 18,
        images: ["/uploads/products/coil/main.jpg","/uploads/products/coil/main-full.webp"],
        thumbnail: "/uploads/products/coil/main.jpg",
        specifications: {
          material: "Ribbed wooden column, Black fabric drum shade",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","coil","artisan wood","ambient lighting","objects for living"],
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Hourglass Table Lamp",
        slug: "hourglass-table-lamp",
        shortDescription: "Two stacked forms meeting at a narrow waist",
        description: "Two rounded wooden forms meet at a narrow waist in a soft, stone-toned finish. A tapered shade and a brass-tone neck complete a lamp that reads as a sculptural object even when switched off.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 13500,
        mrp: 18225,
        discount: 26,
        sku: "ELQ-INT-TL-004",
        stock: 18,
        images: ["/uploads/products/hourglass/main.jpg","/uploads/products/hourglass/main-full.webp"],
        thumbnail: "/uploads/products/hourglass/main.jpg",
        specifications: {
          material: "Stacked wooden forms, Fabric tapered shade, Brass-tone metal fittings",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","hourglass","artisan wood","ambient lighting","objects for living"],
        featured: true,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Flute Table Lamp",
        slug: "flute-table-lamp",
        shortDescription: "Fluted tapering column",
        description: "A tapering column, fluted along its length so the light and shadow shift as you move around it. The wide ivory drum shade spreads a soft, even glow across a bedside or desk.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 8900,
        mrp: 12015,
        discount: 26,
        sku: "ELQ-INT-TL-005",
        stock: 18,
        images: ["/uploads/products/flute/main.jpg","/uploads/products/flute/main-full.webp"],
        thumbnail: "/uploads/products/flute/main.jpg",
        specifications: {
          material: "Fluted wooden column, Fabric drum shade",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","flute","artisan wood","ambient lighting","objects for living"],
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Stem Table Lamp",
        slug: "stem-table-lamp",
        shortDescription: "Slender column on a round foot",
        description: "The simplest piece in the collection: a slim wooden stem on a round foot in a deep walnut tone, with a tapered shade. Stem is made for close, warm light — beside a reading chair, on a side table.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 6900,
        mrp: 9315,
        discount: 26,
        sku: "ELQ-INT-TL-006",
        stock: 18,
        images: ["/uploads/products/stem/main.jpg","/uploads/products/stem/main-full.webp"],
        thumbnail: "/uploads/products/stem/main.jpg",
        specifications: {
          material: "Wooden stem and round foot, Fabric tapered shade",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","stem","artisan wood","ambient lighting","objects for living"],
        featured: false,
        bestSeller: false,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Terrace Table Lamp",
        slug: "terrace-table-lamp",
        shortDescription: "Stepped grooves, wide coned shade",
        description: "A tapering wooden base cut with stepped horizontal grooves, like the terraces of a hillside. The wide coned shade, finished with a dark edge, throws light out and down. Brass-tone fittings at the neck.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 12500,
        mrp: 16875,
        discount: 26,
        sku: "ELQ-INT-TL-007",
        stock: 18,
        images: ["/uploads/products/terrace/main.jpg","/uploads/products/terrace/main-full.webp"],
        thumbnail: "/uploads/products/terrace/main.jpg",
        specifications: {
          material: "Grooved wooden base, Fabric coned shade with contrast piping, Brass-tone metal fittings",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","terrace","artisan wood","ambient lighting","objects for living"],
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Meadow Table Lamp",
        slug: "meadow-table-lamp",
        shortDescription: "Fluted vase base, botanical shade",
        description: "A fluted, vase-shaped base in pale wood beneath a shade softly printed with botanical linework. Meadow is the gentlest piece here — it works in bedrooms and guest rooms. Pull-chain switch, brass-tone fittings.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 7900,
        mrp: 10665,
        discount: 26,
        sku: "ELQ-INT-TL-008",
        stock: 18,
        images: ["/uploads/products/meadow/main.jpg","/uploads/products/meadow/main-full.webp"],
        thumbnail: "/uploads/products/meadow/main.jpg",
        specifications: {
          material: "Fluted wooden base, Printed fabric shade, Brass-tone pull-chain and fittings",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","meadow","artisan wood","ambient lighting","objects for living"],
        featured: false,
        bestSeller: false,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Gourd Table Lamp",
        slug: "gourd-table-lamp",
        shortDescription: "Teardrop base, open grain",
        description: "A full teardrop base that shows off the grain of the wood, with a linen-toned drum shade and a small brass-tone finial. Gourd is a warm, quiet centrepiece for a console or sideboard.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 10900,
        mrp: 14715,
        discount: 26,
        sku: "ELQ-INT-TL-009",
        stock: 18,
        images: ["/uploads/products/gourd/main.jpg","/uploads/products/gourd/main-full.webp"],
        thumbnail: "/uploads/products/gourd/main.jpg",
        specifications: {
          material: "Teardrop wooden base, Fabric drum shade, Brass-tone finial",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","gourd","artisan wood","ambient lighting","objects for living"],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Chisel Table Lamp",
        slug: "chisel-table-lamp",
        shortDescription: "Faceted cone with a textured surface",
        description: "A tapering wooden cone with a faceted, chiselled surface that catches the light in small planes. Paired with a low, wide shade, Chisel has a sculptural presence without any ornament.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 11500,
        mrp: 15525,
        discount: 26,
        sku: "ELQ-INT-TL-010",
        stock: 18,
        images: ["/uploads/products/chisel/main.jpg","/uploads/products/chisel/main-full.webp"],
        thumbnail: "/uploads/products/chisel/main.jpg",
        specifications: {
          material: "Faceted wooden cone, Textured fabric shade",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","chisel","artisan wood","ambient lighting","objects for living"],
        featured: false,
        bestSeller: false,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Bead Table Lamp",
        slug: "bead-table-lamp",
        shortDescription: "Stacked rounded forms on a round base",
        description: "Rounded wooden forms stack into a slender stem, resting on a low round base. A wide coned shade in a warm ivory glows softly — Bead suits shelves and small consoles.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 8500,
        mrp: 11475,
        discount: 26,
        sku: "ELQ-INT-TL-011",
        stock: 18,
        images: ["/uploads/products/bead/main.jpg","/uploads/products/bead/main-full.webp"],
        thumbnail: "/uploads/products/bead/main.jpg",
        specifications: {
          material: "Turned wooden stem and base, Fabric coned shade",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","bead","artisan wood","ambient lighting","objects for living"],
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Sentinel Table Lamp",
        slug: "sentinel-table-lamp",
        shortDescription: "Turned silhouette, large drum shade",
        description: "A turned wooden form with a pronounced collar and a flared foot, finished in a deep tone, holding a large linen-toned drum shade. Sentinel stands tall on a sideboard or dining console.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 12000,
        mrp: 16200,
        discount: 26,
        sku: "ELQ-INT-TL-012",
        stock: 18,
        images: ["/uploads/products/sentinel/main.jpg","/uploads/products/sentinel/main-full.webp"],
        thumbnail: "/uploads/products/sentinel/main.jpg",
        specifications: {
          material: "Turned wooden base, Fabric drum shade",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","sentinel","artisan wood","ambient lighting","objects for living"],
        featured: false,
        bestSeller: false,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Ripple Table Lamp",
        slug: "ripple-table-lamp",
        shortDescription: "Wave-cut cylinder in deep walnut tone",
        description: "Flowing, wave-like lines run the length of a dark wooden cylinder. Under a crisp white drum shade the contrast is strong and the surface texture becomes the point of the lamp.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 13900,
        mrp: 18765,
        discount: 26,
        sku: "ELQ-INT-TL-013",
        stock: 18,
        images: ["/uploads/products/ripple/main.jpg","/uploads/products/ripple/main-full.webp"],
        thumbnail: "/uploads/products/ripple/main.jpg",
        specifications: {
          material: "Wave-textured wooden cylinder, White fabric drum shade",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","ripple","artisan wood","ambient lighting","objects for living"],
        featured: false,
        bestSeller: false,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: "Pebble Table Lamp",
        slug: "pebble-table-lamp",
        shortDescription: "Stacked smooth forms in honey wood",
        description: "Smooth, rounded forms stacked like river pebbles in a honey-toned finish, with a small tapered shade. Pebble is a bedside lamp: compact, warm, and easy on the eyes at night.",
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: "Handcrafted Wood",
        price: 7500,
        mrp: 10125,
        discount: 26,
        sku: "ELQ-INT-TL-014",
        stock: 18,
        images: ["/uploads/products/pebble/main.jpg","/uploads/products/pebble/main-full.webp"],
        thumbnail: "/uploads/products/pebble/main.jpg",
        specifications: {
          material: "Stacked smooth wooden forms, Fabric tapered shade",
          color: "Natural Artisan Wood & Linen",
          dimensions: "32 cm x 32 cm x 46 cm",
          weight: "2.8 kg",
          bulbType: "E27 Warm LED Filament (Included)",
          wattage: "8W Warm White (2700K)",
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ["table lamp","wooden lamp","handcrafted","pebble","artisan wood","ambient lighting","objects for living"],
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },

      {
        name: 'Aurelia Ceramic Table Lamp',
        slug: 'aurelia-ceramic-table-lamp',
        shortDescription: 'Hand-thrown stoneware ceramic table lamp paired with a knife-pleated Belgian linen shade.',
        description:
          'Embodying quiet luxury and grounded tranquility, the Aurelia ceramic lamp features an organic spherical base hand-thrown on the potter’s wheel in earthy off-white stoneware. Topped with a custom Belgian linen knife-pleat shade that softens and diffuses light downwards and upwards, creating an ambiance of serene sophistication.',
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: 'Ceramic & Linen',
        price: 5499,
        mrp: 7999,
        discount: 31,
        sku: 'ELQ-TBL-AUR-01',
        stock: 22,
        images: [
          '/uploads/prod-ceramic-spherical.jpg',
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'
        ],
        thumbnail: '/uploads/prod-ceramic-spherical.jpg',
        specifications: {
          material: 'Hand-Thrown Speckled Stoneware Ceramic & Belgian Linen',
          color: 'Speckled Oat White & Natural Flax',
          dimensions: '28 cm (Dia) x 48 cm (H)',
          weight: '3.4 kg',
          bulbType: 'E27 Warm LED Filament (Included)',
          wattage: '9W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['ceramic lamp', 'pleated shade', 'japandi', 'minimalist', 'bedside', 'table lamp'],
        featured: true,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 34 }
      },
      {
        name: 'Luna Glass Table Lamp',
        slug: 'luna-glass-table-lamp',
        shortDescription: 'Mouth-blown frosted opaline glass orb floating serenely atop a brushed satin brass plinth.',
        description:
          'A study in planetary poise and balanced illumination. The Luna Table Lamp incorporates a mouth-blown opaline globe that gently diffuses 360 degrees of golden luminescence without glare. Finished with a heavy spun brass base and an antique twisted textile cord with brass rotary switch.',
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: 'Glass & Brass',
        price: 6299,
        mrp: 8999,
        discount: 30,
        sku: 'ELQ-TBL-LUN-02',
        stock: 16,
        images: [
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-brass-fluted.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Mouth-Blown Opaline Glass & Heavy Spun Brass',
          color: 'Milk White & Brushed Satin Brass',
          dimensions: '25 cm (Dia) x 36 cm (H)',
          weight: '2.6 kg',
          bulbType: 'G9 Frosted Capsule LED (Included)',
          wattage: '6W Warm Glow (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['glass lamp', 'brass base', 'opaline', 'ambient lighting', 'luxury table lamp'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.8, count: 27 }
      },
      {
        name: 'Elara Brass Table Lamp',
        slug: 'elara-brass-table-lamp',
        shortDescription: 'Solid spun unlacquered brass dome lamp casting a golden cascade of downward ambient radiance.',
        description:
          'Machined from heavy gauge virgin brass, the Elara features a hemispherical dome reflector supported by a slender stem. The interior of the shade is satin-brushed to produce an intensely warm, ambient reflective glow that enriches dark timber surfaces and study consoles.',
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: 'Pure Brass',
        price: 7499,
        mrp: 10499,
        discount: 29,
        sku: 'ELQ-TBL-ELA-03',
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
          '/uploads/hero-slide-2.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Solid Spun Pure Brass with Brushed Satin Finish',
          color: 'Warm Golden Brass',
          dimensions: '30 cm (Dia) x 42 cm (H)',
          weight: '3.8 kg',
          bulbType: 'E27 Vintage Filament LED (Included)',
          wattage: '8W Warm White (2400K)',
          voltage: '220V - 240V AC',
          warranty: '3 Years ELQARA Manufacturer Warranty'
        },
        tags: ['brass lamp', 'solid brass', 'sculptural', 'architectural lamp', 'table lamp'],
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 5.0, count: 19 }
      },
      {
        name: 'Siena Stone Table Lamp',
        slug: 'siena-stone-table-lamp',
        shortDescription: 'Monolithic honed Italian beige travertine stone lamp crowned with satin brass fittings.',
        description:
          'Carved from solid quarry-cut Italian travertine, each Siena stone lamp exhibits raw mineral striations and porous natural texture. The tactile contrast between heavy ancient limestone and precision brass switches provides an enduring statement for modern living rooms.',
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: 'Travertine Stone',
        price: 6899,
        mrp: 9499,
        discount: 27,
        sku: 'ELQ-TBL-SIE-04',
        stock: 14,
        images: [
          '/uploads/prod-travertine-block.jpg',
          'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=1000&q=80'
        ],
        thumbnail: '/uploads/prod-travertine-block.jpg',
        specifications: {
          material: 'Natural Italian Travertine & Solid Brushed Brass',
          color: 'Warm Beige Travertine & Satin Gold',
          dimensions: '18 cm (W) x 18 cm (D) x 32 cm (H)',
          weight: '4.8 kg',
          bulbType: 'G9 Frosted LED Capsule (Included)',
          wattage: '5W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['travertine', 'stone lamp', 'brutalist', 'monolithic', 'table lamp'],
        featured: true,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 22 }
      },
      {
        name: 'Nova Mushroom Table Lamp',
        slug: 'nova-mushroom-table-lamp',
        shortDescription: 'Organic mushroom dome silhouette hand-turned in seasoned Saharanpur walnut and brushed brass.',
        description:
          'An icon of Mid-Century Scandinavian design reinterpreted through the artisanal woodworking traditions of Saharanpur, Uttar Pradesh. The organic mushroom contour reveals rich, natural timber grain beneath an organic beeswax sealant.',
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: 'Artisan Woodwork',
        price: 6499,
        mrp: 8999,
        discount: 28,
        sku: 'ELQ-TBL-NOV-05',
        stock: 18,
        images: [
          '/uploads/prod-mushroom-wood.jpg',
          'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=1000&q=80'
        ],
        thumbnail: '/uploads/prod-mushroom-wood.jpg',
        specifications: {
          material: 'Solid Saharanpur Walnut Timber & Brass Hardware',
          color: 'Natural Dark Walnut',
          dimensions: '32 cm (Dia) x 46 cm (H)',
          weight: '2.8 kg',
          bulbType: 'E27 Warm Filament LED (Included)',
          wattage: '8W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['walnut', 'mushroom lamp', 'wooden lamp', 'handcrafted', 'table lamp'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 41 }
      },
      {
        name: 'Aria Linen Table Lamp',
        slug: 'aria-linen-table-lamp',
        shortDescription: 'Sculptural conical ceramic base wrapped in unbleached Belgian linen with antique toggle switch.',
        description:
          'Soft, tactful and quietly commanding. The Aria Linen lamp pairs an earthenware base with an airy flax linen shade that filters warm light gracefully across bedside tables, home libraries, and intimate credenzas.',
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: 'Ceramic & Linen',
        price: 4899,
        mrp: 6999,
        discount: 30,
        sku: 'ELQ-TBL-ARI-06',
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-ceramic-spherical.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Textured Stoneware Ceramic & Unbleached Belgian Flax Linen',
          color: 'Natural Oatmeal & Chalk White',
          dimensions: '26 cm (Dia) x 44 cm (H)',
          weight: '2.9 kg',
          bulbType: 'E27 Warm White LED (Included)',
          wattage: '7W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['linen lamp', 'bedside lamp', 'ceramic', 'neutral aesthetic', 'table lamp'],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.8, count: 29 }
      },
      {
        name: 'Halo Marble Table Lamp',
        slug: 'halo-marble-table-lamp',
        shortDescription: 'Pure white Carrara marble pedestal with a brushed champagne brass halo and dual warm dimming.',
        description:
          'Sculpted from hand-selected slabs of dense Carrara marble. The brushed champagne gold arch cradles an internal warm LED array that casts a delicate, halo-like backglow, ideal for architectural consoles and sophisticated living spaces.',
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: 'Marble & Brass',
        price: 8199,
        mrp: 11999,
        discount: 32,
        sku: 'ELQ-TBL-HLM-07',
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-brass-fluted.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Solid Carrara Marble & Brushed Champagne Gold Brass',
          color: 'Veined Carrara White & Champagne Gold',
          dimensions: '22 cm (Dia) x 38 cm (H)',
          weight: '5.2 kg',
          bulbType: 'Integrated Warm-Dim Architectural LED Array',
          wattage: '10W (2700K - 2200K Smooth Dimming)',
          voltage: '220V - 240V AC',
          warranty: '3 Years ELQARA Manufacturer Warranty'
        },
        tags: ['marble lamp', 'carrara marble', 'halo lamp', 'luxury lighting', 'table lamp'],
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 5.0, count: 15 }
      },

      // ==========================================
      // FLOOR LAMPS (Prompt 8-13)
      // ==========================================
      {
        name: 'Arco Modern Floor Lamp',
        slug: 'arco-modern-floor-lamp',
        shortDescription: 'Sweeping steam-bent walnut arc with an opaline glass orb and weighted cast brass footing.',
        description:
          'A majestic architectural statement for spacious living rooms and lounge spaces. A grand steam-bent walnut cantilever gently arches overhead, suspending a hand-blown opaline globe that bathes seating arrangements in tranquil, indirect luminescence.',
        category: catMap['floor-lamps']._id,
        categoryName: 'Floor Lamps',
        subcategory: 'Arc Floor Lamps',
        price: 14999,
        mrp: 19999,
        discount: 25,
        sku: 'ELQ-FLR-ARC-08',
        stock: 8,
        images: [
          '/uploads/prod-arc-floor.jpg',
          'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80'
        ],
        thumbnail: '/uploads/prod-arc-floor.jpg',
        specifications: {
          material: 'Solid Steam-Bent Walnut, Hand-Blown Opaline Glass, Cast Brass Base',
          color: 'American Walnut & Matte Satin Brass',
          dimensions: '85 cm (W) x 185 cm (H) x 35 cm (Base Dia)',
          weight: '9.4 kg',
          bulbType: 'E27 Opaline Diffuser LED Bulb (Included)',
          wattage: '12W Dimmable Warm White (3000K)',
          voltage: '220V - 240V AC',
          warranty: '3 Years ELQARA Manufacturer Warranty'
        },
        tags: ['floor lamp', 'arc lamp', 'statement piece', 'living room', 'woodwork'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 5.0, count: 18 }
      },
      {
        name: 'Orion Tripod Floor Lamp',
        slug: 'orion-tripod-floor-lamp',
        shortDescription: 'Turned Saharanpur teak tripod legs with brushed brass knuckles and a tailored linen drum.',
        description:
          'Inspired by surveyor tripod instruments of the early 20th century, the Orion features hand-turned solid teak legs connected by knurled brass hardware. Topped with a large natural linen cylinder that casts a warm, soothing ambient light.',
        category: catMap['floor-lamps']._id,
        categoryName: 'Floor Lamps',
        subcategory: 'Tripod Floor Lamps',
        price: 11499,
        mrp: 15999,
        discount: 28,
        sku: 'ELQ-FLR-ORI-09',
        stock: 11,
        images: [
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
          '/uploads/hero-slide-3.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Seasoned Teak Timber, Brass Knurled Hardware, Belgian Linen',
          color: 'Golden Teak & Warm Ecru',
          dimensions: '55 cm (W) x 55 cm (D) x 158 cm (H)',
          weight: '5.8 kg',
          bulbType: 'E27 LED Bulb (Included)',
          wattage: '12W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '3 Years ELQARA Manufacturer Warranty'
        },
        tags: ['tripod lamp', 'floor lamp', 'teak wood', 'mid century', 'living room'],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.8, count: 23 }
      },
      {
        name: 'Zenith Arc Floor Lamp',
        slug: 'zenith-arc-floor-lamp',
        shortDescription: 'Industrial matte black powdered steel arc with an antique spun brass dome reflector.',
        description:
          'The Zenith brings dramatic architectural stature to lounge areas. Its cantilevered steel arm extends effortlessly over deep sectionals, directing rich downward radiance through an oversized hand-spun brass dome.',
        category: catMap['floor-lamps']._id,
        categoryName: 'Floor Lamps',
        subcategory: 'Arc Floor Lamps',
        price: 16999,
        mrp: 22999,
        discount: 26,
        sku: 'ELQ-FLR-ZEN-10',
        stock: 7,
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-arc-floor.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Carbon Steel Spine, Spun Antique Brass Reflector, Cast Iron Footing',
          color: 'Matte Charcoal & Satin Brass',
          dimensions: '110 cm (Reach) x 205 cm (H) x 40 cm (Base Dia)',
          weight: '14.2 kg',
          bulbType: 'E27 High-Output LED (Included)',
          wattage: '14W Dimmable Warm White (3000K)',
          voltage: '220V - 240V AC',
          warranty: '3 Years ELQARA Manufacturer Warranty'
        },
        tags: ['arc lamp', 'floor lamp', 'oversized lamp', 'lounge lighting', 'statement fixture'],
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 12 }
      },
      {
        name: 'Halo Minimal Floor Lamp',
        slug: 'halo-minimal-floor-lamp',
        shortDescription: 'Slender architectural aluminum silhouette with 360-degree rotatable warm ambient strip.',
        description:
          'Minimalism distilled to pure geometry. This ultra-slender floor fixture hugs wall corners and book recesses, providing indirect bounce lighting that transforms vertical wall surfaces into luminous canvases.',
        category: catMap['floor-lamps']._id,
        categoryName: 'Floor Lamps',
        subcategory: 'Minimalist Floor Lamps',
        price: 9999,
        mrp: 13499,
        discount: 26,
        sku: 'ELQ-FLR-HLM-11',
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
          '/uploads/hero-slide-1.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Extruded Aircraft Aluminum & Cast Iron Counterweight Base',
          color: 'Anodized Matte Black & Champagne Gold Pivot',
          dimensions: '15 cm (Base Dia) x 150 cm (H)',
          weight: '3.9 kg',
          bulbType: 'Continuous Linear High-CRI LED Strip (Integrated)',
          wattage: '18W Dimmable Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '3 Years ELQARA Manufacturer Warranty'
        },
        tags: ['minimalist lamp', 'corner floor lamp', 'modern floor lamp', 'led fixture'],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.8, count: 31 }
      },
      {
        name: 'Oslo Wooden Floor Lamp',
        slug: 'oslo-wooden-floor-lamp',
        shortDescription: 'Nordic white oak column floor lamp with tapered drum shade in hand-spun ivory flax.',
        description:
          'Harmonizing Scandinavian restraint with pure Indian woodturning craftsmanship. Solid FSC-certified white oak timber is turned into a refined tapered mast, grounded on a disc plinth and fitted with solid brass pull-chain detailing.',
        category: catMap['floor-lamps']._id,
        categoryName: 'Floor Lamps',
        subcategory: 'Nordic Wood',
        price: 12799,
        mrp: 17999,
        discount: 29,
        sku: 'ELQ-FLR-OSL-12',
        stock: 9,
        images: [
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-arc-floor.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Solid White Oak Timber, Spun Ivory Flax Linen Shade, Antique Brass Pull',
          color: 'Natural Pale Oak & Ivory Flax',
          dimensions: '42 cm (Dia) x 162 cm (H)',
          weight: '6.4 kg',
          bulbType: 'E27 Warm Diffused LED Bulb (Included)',
          wattage: '10W (2700K Warm White)',
          voltage: '220V - 240V AC',
          warranty: '3 Years ELQARA Manufacturer Warranty'
        },
        tags: ['wooden floor lamp', 'scandinavian', 'oak wood', 'reading lamp', 'living room'],
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 16 }
      },
      {
        name: 'Vela Standing Lamp',
        slug: 'vela-standing-lamp',
        shortDescription: 'Sculptural carved Sheesham hardwood pedestal crowned with a dual knife-pleated shade.',
        description:
          'A majestic statement piece celebrating Saharanpur heritage woodworking. Sculpted from seasoned Sheesham rosewood with gentle organic curves, holding twin bulbs within a cascading linen shade that illuminates both ceiling and floor.',
        category: catMap['floor-lamps']._id,
        categoryName: 'Floor Lamps',
        subcategory: 'Artisan Woodwork',
        price: 13499,
        mrp: 18499,
        discount: 27,
        sku: 'ELQ-FLR-VEL-13',
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-arc-floor.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Seasoned Sheesham Timber, Brass Fittings, Pleated Chiffon Fabric',
          color: 'Deep Honey Rosewood & Soft Cream',
          dimensions: '45 cm (Dia) x 168 cm (H)',
          weight: '8.1 kg',
          bulbType: '2x E27 Warm White LED Bulbs (Included)',
          wattage: '2x 8W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '3 Years ELQARA Manufacturer Warranty'
        },
        tags: ['sheesham', 'standing lamp', 'carved wood', 'pleated lamp', 'floor lamp'],
        featured: true,
        bestSeller: false,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.8, count: 14 }
      },

      // ==========================================
      // PENDANT LIGHTS (Prompt 14-19)
      // ==========================================
      {
        name: 'Luna Pendant Light',
        slug: 'luna-pendant-light',
        shortDescription: 'Mouth-blown opaline glass sphere suspended on solid machined brass canopy and braided cord.',
        description:
          'Purity of form and celestial illumination. The Luna pendant features a flawless blown opaline glass orb suspended from an unlacquered brass fitting and braided cotton flex. Emits a rich, shadowless glow above dining tables and kitchen islands.',
        category: catMap['pendant-lights']._id,
        categoryName: 'Pendant Lights',
        subcategory: 'Glass Pendants',
        price: 6799,
        mrp: 9499,
        discount: 28,
        sku: 'ELQ-PEN-LUN-14',
        stock: 14,
        images: [
          'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-pendant-woven.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Mouth-Blown Opaline Glass & Machined Solid Brass',
          color: 'Matte Opal White & Satin Brass',
          dimensions: '30 cm (Dia) with 2m Adjustable Braided Cable',
          weight: '2.1 kg',
          bulbType: 'E27 Warm Opaline Diffuser LED (Included)',
          wattage: '9W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['pendant light', 'opaline glass', 'dining light', 'hanging lamp', 'brass pendant'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 28 }
      },
      {
        name: 'Aurora Glass Pendant',
        slug: 'aurora-glass-pendant',
        shortDescription: 'Ribbed fluted amber borosilicate crystal cylinder with exposed vintage filament glow.',
        description:
          'Optically captivating ribbed amber crystal refracts radiant filaments into mesmerizing linear patterns across ceilings and walls. Complemented by brushed brass canopy detailing and a twisted antique cord.',
        category: catMap['pendant-lights']._id,
        categoryName: 'Pendant Lights',
        subcategory: 'Fluted Glass',
        price: 7299,
        mrp: 9999,
        discount: 27,
        sku: 'ELQ-PEN-AUR-15',
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-brass-fluted.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Ribbed Fluted Amber Borosilicate Glass & Brushed Brass',
          color: 'Amber Honey & Satin Gold',
          dimensions: '20 cm (Dia) x 36 cm (H) with 2m Cord',
          weight: '2.4 kg',
          bulbType: 'E27 Vintage Squirrel Cage LED (Included)',
          wattage: '7W Warm Amber White (2200K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['fluted glass', 'amber light', 'pendant light', 'kitchen island', 'vintage glow'],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.8, count: 21 }
      },
      {
        name: 'Solis Dome Pendant',
        slug: 'solis-dome-pendant',
        shortDescription: 'Handcrafted ceramic terracotta dome with gold-leaf interior casting concentrated warm radiance.',
        description:
          'An architectural focal point for culinary and dining settings. The exterior presents a raw, earthy unglazed terracotta finish, while the interior is lined with hand-hammered gold leaf that multiplies bulb warmth into an intimate downward glow.',
        category: catMap['pendant-lights']._id,
        categoryName: 'Pendant Lights',
        subcategory: 'Ceramic & Terracotta',
        price: 8499,
        mrp: 11999,
        discount: 29,
        sku: 'ELQ-PEN-SOL-16',
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-pendant-woven.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Natural Terracotta Clay & Hand-Applied Gold Leaf Foil',
          color: 'Matte Terracotta & Warm Gold Interior',
          dimensions: '38 cm (Dia) x 24 cm (H) with 2m Braided Cable',
          weight: '3.6 kg',
          bulbType: 'E27 Warm LED Reflector Bulb (Included)',
          wattage: '11W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['terracotta', 'dome pendant', 'dining table lamp', 'ceramic pendant', 'handcrafted'],
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 5.0, count: 17 }
      },
      {
        name: 'Nova Linear Pendant',
        slug: 'nova-linear-pendant',
        shortDescription: 'Solid milled Saharanpur walnut timber beam with recessed anti-glare warm LED channel.',
        description:
          'Engineered for modern dining tables, kitchen islands, and boardroom credenzas. A 120cm beam of seasoned walnut wood contains an integrated downward architectural LED channel that casts continuous, glare-free light.',
        category: catMap['pendant-lights']._id,
        categoryName: 'Pendant Lights',
        subcategory: 'Linear Pendants',
        price: 11899,
        mrp: 15999,
        discount: 26,
        sku: 'ELQ-PEN-NOV-17',
        stock: 7,
        images: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-mushroom-wood.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Solid Saharanpur Walnut Timber & Satin Brass End Caps',
          color: 'Dark Natural Walnut & Satin Gold',
          dimensions: '120 cm (L) x 6 cm (W) x 8 cm (H) with 2m Steel Suspension',
          weight: '4.2 kg',
          bulbType: 'High-CRI 95+ Seamless LED Architectural Strip (Integrated)',
          wattage: '24W Dimmable Warm White (3000K)',
          voltage: '220V - 240V AC',
          warranty: '3 Years ELQARA Manufacturer Warranty'
        },
        tags: ['linear pendant', 'dining light', 'walnut timber', 'kitchen island', 'modern chandelier'],
        featured: true,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 25 }
      },
      {
        name: 'Élan Brass Pendant',
        slug: 'elan-brass-pendant',
        shortDescription: 'Hand-hammered aged brass cone pendant with scalloped rim and warm downward focus.',
        description:
          'Showcasing the historic metalcraft traditions of Moradabad and Saharanpur. Solid brass sheet is hand-hammered to form subtle surface dimples that catch specular light, culminating in an artisanal luminaire rich with timeless character.',
        category: catMap['pendant-lights']._id,
        categoryName: 'Pendant Lights',
        subcategory: 'Hammered Brass',
        price: 6499,
        mrp: 8999,
        discount: 28,
        sku: 'ELQ-PEN-ELA-18',
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-brass-fluted.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Hand-Hammered Solid Brass with Antiqued Patina',
          color: 'Antiqued Satin Brass',
          dimensions: '28 cm (Dia) x 30 cm (H) with 2m Braided Cable',
          weight: '1.9 kg',
          bulbType: 'E27 Warm Filament LED (Included)',
          wattage: '8W Warm White (2400K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['brass pendant', 'hammered brass', 'handcrafted', 'kitchen pendant', 'lighting'],
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.8, count: 18 }
      },
      {
        name: 'Orb Minimal Pendant',
        slug: 'orb-minimal-pendant',
        shortDescription: 'Frosted spherical borosilicate glass orb resting in a minimal satin brass cradle.',
        description:
          'A timeless modern sphere suspended by an ultra-thin stainless steel wire and silk cord. The frosted glass diffuser provides uniform 360-degree illumination that eliminates glare while exuding serenity.',
        category: catMap['pendant-lights']._id,
        categoryName: 'Pendant Lights',
        subcategory: 'Glass Pendants',
        price: 5899,
        mrp: 7999,
        discount: 26,
        sku: 'ELQ-PEN-ORB-19',
        stock: 16,
        images: [
          'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-pendant-woven.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Frosted Borosilicate Glass & Unlacquered Brass Accent',
          color: 'Frosted Opal & Brushed Brass',
          dimensions: '22 cm (Dia) with 2m Adjustable Wire',
          weight: '1.5 kg',
          bulbType: 'G9 Capsule LED (Included)',
          wattage: '5W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['orb pendant', 'minimalist pendant', 'glass sphere', 'dining light'],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.7, count: 20 }
      },

      // ==========================================
      // WALL LIGHTS (Prompt 20-23)
      // ==========================================
      {
        name: 'Halo Wall Sconce',
        slug: 'halo-wall-sconce',
        shortDescription: 'Spun brushed brass disc sconce projecting a soft halo of indirect ambient wall radiance.',
        description:
          'The Halo Wall Sconce transforms flat drywall into an ethereal luminous sculpture. A solid circular brass plate conceals an integrated LED ring that reflects a perimeter aura of warm, calm light against the wall.',
        category: catMap['wall-lights']._id,
        categoryName: 'Wall Lights',
        subcategory: 'Indirect Sconces',
        price: 4499,
        mrp: 6299,
        discount: 29,
        sku: 'ELQ-WAL-HAL-20',
        stock: 24,
        images: [
          'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-brass-fluted.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Solid Spun Brass Plate & Aluminum Heat Sink Backplate',
          color: 'Brushed Satin Gold',
          dimensions: '24 cm (Dia) x 6 cm (Depth)',
          weight: '1.4 kg',
          bulbType: 'Integrated Warm Architectural LED Ring',
          wattage: '8W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['wall sconce', 'halo light', 'brass sconce', 'indirect lighting', 'hallway light'],
        featured: true,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 33 }
      },
      {
        name: 'Aurelia Brass Wall Lamp',
        slug: 'aurelia-brass-wall-lamp',
        shortDescription: 'Articulating brushed brass swing arm with a fluted amber glass cup and thumb toggle.',
        description:
          'A versatile luminaire for reading nooks and bedside headboards. The precision-machined brass arm pivots 180 degrees horizontally, delivering targeted warm illumination through fluted amber crystal.',
        category: catMap['wall-lights']._id,
        categoryName: 'Wall Lights',
        subcategory: 'Swing Arm Sconces',
        price: 5199,
        mrp: 7199,
        discount: 28,
        sku: 'ELQ-WAL-AUR-21',
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-brass-fluted.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Machined Heavy Brass & Ribbed Amber Borosilicate Glass',
          color: 'Aged Satin Brass & Amber Glass',
          dimensions: '35 cm (Reach) x 16 cm (W) x 28 cm (H)',
          weight: '2.2 kg',
          bulbType: 'E14 Warm LED Filament Bulb (Included)',
          wattage: '6W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['wall lamp', 'brass sconce', 'bedside sconce', 'swing arm', 'reading lamp'],
        featured: false,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.8, count: 19 }
      },
      {
        name: 'Eclipse Minimal Wall Light',
        slug: 'eclipse-minimal-wall-light',
        shortDescription: 'Dual concentric discs in blackened iron and brushed gold creating celestial phase lighting.',
        description:
          'Inspired by lunar eclipses, this wall sconce pairs two overlapping geometric discs. The front disc rotates smoothly by hand, allowing the occupant to manually alter the crescent of light emitted into the room.',
        category: catMap['wall-lights']._id,
        categoryName: 'Wall Lights',
        subcategory: 'Sculptural Sconces',
        price: 4899,
        mrp: 6799,
        discount: 28,
        sku: 'ELQ-WAL-ECL-22',
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-travertine-block.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Blackened Carbon Steel & Spun Satin Brass Disc',
          color: 'Matte Charcoal & Satin Gold',
          dimensions: '26 cm (Dia) x 7 cm (Depth)',
          weight: '1.8 kg',
          bulbType: 'Concealed Perimeter Warm LED Strip (Integrated)',
          wattage: '10W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['eclipse light', 'wall sconce', 'blackened steel', 'minimalist wall light'],
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 16 }
      },
      {
        name: 'Nova Cylinder Wall Light',
        slug: 'nova-cylinder-wall-light',
        shortDescription: 'Dual-directional up-and-down ribbed glass cylinder on a solid brushed brass wall mount.',
        description:
          'Casting dramatic vertical architectural light columns upwards towards the ceiling and downwards across floors. Built with thick fluted glass optics and weatherproof sealed brass caps suitable for indoor and covered corridors.',
        category: catMap['wall-lights']._id,
        categoryName: 'Wall Lights',
        subcategory: 'Up & Down Sconces',
        price: 3999,
        mrp: 5499,
        discount: 27,
        sku: 'ELQ-WAL-NOV-23',
        stock: 22,
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-brass-fluted.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Ribbed Fluted Glass Cylinder & Solid Brushed Brass',
          color: 'Clear Ribbed & Warm Satin Brass',
          dimensions: '10 cm (Dia) x 28 cm (H) x 12 cm (Depth)',
          weight: '1.7 kg',
          bulbType: '2x GU10 Warm White LED Bulbs (Included)',
          wattage: '2x 5W (2700K Warm White)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['cylinder light', 'up down sconce', 'wall light', 'corridor light', 'fluted glass'],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.7, count: 24 }
      },

      // ==========================================
      // DESK LAMPS (24-25)
      // ==========================================
      {
        name: 'Kanso Solid Brass Task Desk Lamp',
        slug: 'kanso-solid-brass-task-desk-lamp',
        shortDescription: 'Articulating precision counterweighted task luminaire milled from solid virgin brass.',
        description:
          'A tribute to functional Japanese minimalism and fine machining. The Kanso task lamp balances on a smooth counterweight hinge, allowing effortless directional fingertip adjustment across executive drafting desks.',
        category: catMap['desk-lamps']._id,
        categoryName: 'Desk Lamps',
        subcategory: 'Task Lighting',
        price: 6999,
        mrp: 9499,
        discount: 26,
        sku: 'ELQ-DSK-KAN-24',
        stock: 14,
        images: [
          'https://images.unsplash.com/photo-1580481077195-c3f91572911b?auto=format&fit=crop&w=1000&q=80',
          '/uploads/hero-slide-2.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1580481077195-c3f91572911b?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Solid Milled Brass with Satin Lacquer Coating',
          color: 'Warm Brushed Brass',
          dimensions: '48 cm (Reach) x 18 cm (Base Dia) x 45 cm (H)',
          weight: '3.6 kg',
          bulbType: 'High-CRI 95+ Directional Task LED (Integrated)',
          wattage: '8W Warm White (3000K Neutral Warm)',
          voltage: '220V - 240V AC',
          warranty: '3 Years ELQARA Manufacturer Warranty'
        },
        tags: ['desk lamp', 'task lamp', 'brass lamp', 'office lighting', 'study lamp'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 29 }
      },
      {
        name: 'Architect Studio Matte Black Desk Lamp',
        slug: 'architect-studio-matte-black-desk-lamp',
        shortDescription: 'Industrial balanced cantilever desk lamp in matte carbon steel with solid rosewood adjustments.',
        description:
          'Designed for architects, writers, and creative workspaces. Twin tension springs and Saharanpur rosewood thumb knobs ensure stable positioning at any angle, focusing non-glare illumination precisely where required.',
        category: catMap['desk-lamps']._id,
        categoryName: 'Desk Lamps',
        subcategory: 'Studio Lamps',
        price: 5799,
        mrp: 7999,
        discount: 28,
        sku: 'ELQ-DSK-ARC-25',
        stock: 16,
        images: [
          'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-mushroom-wood.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Carbon Steel Arm, Cast Base, Saharanpur Rosewood Knobs',
          color: 'Matte Charcoal Black & Deep Honey Timber',
          dimensions: '52 cm (Reach) x 20 cm (Base Dia) x 50 cm (H)',
          weight: '4.1 kg',
          bulbType: 'E27 High-CRI LED Reflector Bulb (Included)',
          wattage: '9W Neutral Warm White (3000K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['architect lamp', 'studio desk lamp', 'matte black', 'study lamp'],
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.8, count: 15 }
      },

      // ==========================================
      // CEILING LIGHTS (26-27)
      // ==========================================
      {
        name: 'Astra Flush Mount Opaline Ceiling Light',
        slug: 'astra-flush-mount-opaline-ceiling-light',
        shortDescription: 'Shallow mouth-blown opaline glass dish with solid brushed brass retaining ring.',
        description:
          'Engineered for rooms with standard ceiling heights. The shallow opaline glass dome mounts flush against the ceiling plane, providing expansive, shadow-free room illumination wrapped in warm brass jewelry accents.',
        category: catMap['ceiling-lights']._id,
        categoryName: 'Ceiling Lights',
        subcategory: 'Flush Mounts',
        price: 7899,
        mrp: 10999,
        discount: 28,
        sku: 'ELQ-CLG-AST-26',
        stock: 11,
        images: [
          'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-brass-fluted.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Mouth-Blown Opaline Glass Bowl & Heavy Spun Brass Ring',
          color: 'Frosted Opal & Brushed Brass',
          dimensions: '36 cm (Dia) x 12 cm (Drop)',
          weight: '2.8 kg',
          bulbType: '3x E27 Warm LED Bulbs (Included)',
          wattage: '3x 8W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['ceiling light', 'flush mount', 'opaline glass', 'brass ceiling fixture', 'bedroom lighting'],
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 14 }
      },
      {
        name: 'Solstice Fluted Glass Ceiling Fixture',
        slug: 'solstice-fluted-glass-ceiling-fixture',
        shortDescription: 'Concentric ribbed fluted glass shade with hand-turned Saharanpur walnut canopy collar.',
        description:
          'A harmonious marriage of glassblowing and Indian woodcraft. Hand-cut ribbed amber crystal sends rippling golden refractions across the ceiling, framed by seasoned walnut accents.',
        category: catMap['ceiling-lights']._id,
        categoryName: 'Ceiling Lights',
        subcategory: 'Semi-Flush Fixtures',
        price: 8499,
        mrp: 11999,
        discount: 29,
        sku: 'ELQ-CLG-SOL-27',
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-mushroom-wood.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Ribbed Amber Glass & Turned Solid Walnut Wood',
          color: 'Warm Amber & Deep Walnut',
          dimensions: '32 cm (Dia) x 16 cm (Drop)',
          weight: '3.1 kg',
          bulbType: '2x E27 Filament LED Bulbs (Included)',
          wattage: '2x 9W (2700K Warm White)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['ceiling light', 'fluted glass', 'walnut wood', 'flush mount', 'hallway lighting'],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.8, count: 17 }
      },

      // ==========================================
      // BEDSIDE LAMPS (28-29)
      // ==========================================
      {
        name: 'Somnus Touch-Dimmable Bedside Lamp',
        slug: 'somnus-touch-dimmable-bedside-lamp',
        shortDescription: 'Speckled matte ceramic bedside luminaire with stepless capacitive brass touch dimming.',
        description:
          'Engineered for deep evening rest. Touching anywhere on the brass collar activates an ultra-low glare warm-dim LED that transitions from an intimate 1800K candle glow to comfortable reading luminance.',
        category: catMap['bedside-lamps']._id,
        categoryName: 'Bedside Lamps',
        subcategory: 'Touch Dimmable',
        price: 4699,
        mrp: 6499,
        discount: 28,
        sku: 'ELQ-BED-SOM-28',
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-ceramic-spherical.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Speckled Stoneware Ceramic & Solid Touch Brass Collar',
          color: 'Muted Sand & Satin Brass',
          dimensions: '20 cm (Dia) x 32 cm (H)',
          weight: '2.1 kg',
          bulbType: 'Integrated Warm-Dim Sleep LED (1800K - 2700K)',
          wattage: '6W Stepless Capacitive Dimming',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['bedside lamp', 'touch lamp', 'dimmable lamp', 'ceramic lamp', 'nightstand'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 37 }
      },
      {
        name: 'Calma Travertine Bedside Luminaire',
        slug: 'calma-travertine-bedside-luminaire',
        shortDescription: 'Cylindrical honed Italian travertine stone with an internal frosted diffused glass core.',
        description:
          'Natural Italian beige travertine stone cut into a compact cylinder with an recessed frosted opaline lens. Its compact footprint fits effortlessly on intimate bedside consoles while offering serene bedtime lighting.',
        category: catMap['bedside-lamps']._id,
        categoryName: 'Bedside Lamps',
        subcategory: 'Stone Lighting',
        price: 5299,
        mrp: 7499,
        discount: 29,
        sku: 'ELQ-BED-CAL-29',
        stock: 17,
        images: [
          '/uploads/prod-travertine-block.jpg',
          'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=1000&q=80'
        ],
        thumbnail: '/uploads/prod-travertine-block.jpg',
        specifications: {
          material: 'Natural Honed Travertine Stone & Opaline Glass',
          color: 'Warm Beige Travertine',
          dimensions: '14 cm (Dia) x 26 cm (H)',
          weight: '3.6 kg',
          bulbType: 'G9 Warm Capsule LED (Included)',
          wattage: '4W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['travertine', 'bedside lamp', 'stone lamp', 'minimalist bedside'],
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.8, count: 16 }
      },

      // ==========================================
      // DECORATIVE LAMPS (30-31)
      // ==========================================
      {
        name: 'Sculptura Geometric Terracotta Lamp',
        slug: 'sculptura-geometric-terracotta-lamp',
        shortDescription: 'Abstract sculptural earthenware lamp that doubles as an avant-garde ceramic art object.',
        description:
          'Blurring the boundary between functional lighting and fine gallery sculpture. Hand-modeled by studio ceramicists with raw, unglazed terracotta contours that cast intriguing shadow play across neighboring surfaces.',
        category: catMap['decorative-lamps']._id,
        categoryName: 'Decorative Lamps',
        subcategory: 'Artisan Ceramics',
        price: 5999,
        mrp: 8299,
        discount: 28,
        sku: 'ELQ-DEC-SCU-30',
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-ceramic-spherical.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Raw Terracotta Earthenware & Brass Internal Sockets',
          color: 'Earthy Burnt Ochre',
          dimensions: '24 cm (W) x 18 cm (D) x 39 cm (H)',
          weight: '3.5 kg',
          bulbType: 'E27 Vintage Amber Globe LED (Included)',
          wattage: '6W Warm Filament (2200K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['sculptural lamp', 'terracotta lamp', 'decorative lamp', 'art object', 'ceramic lamp'],
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 5.0, count: 11 }
      },
      {
        name: 'Botanica Ribbed Amber Accent Lamp',
        slug: 'botanica-ribbed-amber-accent-lamp',
        shortDescription: 'Fluted botanical blown-glass luminaire grounded on an organic turned walnut pedestal.',
        description:
          'Inspired by organic seed pod geometry, the Botanica features fluted amber mouth-blown glass mounted over a turned walnut pedestal. Illuminates intimate bookshelves, credenzas, and cocktail bar displays.',
        category: catMap['decorative-lamps']._id,
        categoryName: 'Decorative Lamps',
        subcategory: 'Accent Lighting',
        price: 4999,
        mrp: 6999,
        discount: 29,
        sku: 'ELQ-DEC-BOT-31',
        stock: 16,
        images: [
          '/uploads/prod-brass-fluted.jpg',
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80'
        ],
        thumbnail: '/uploads/prod-brass-fluted.jpg',
        specifications: {
          material: 'Amber Borosilicate Glass & Saharanpur Walnut Wood',
          color: 'Golden Amber & Rich Walnut',
          dimensions: '18 cm (Dia) x 29 cm (H)',
          weight: '1.8 kg',
          bulbType: 'E14 Warm LED Filament (Included)',
          wattage: '5W Warm Glow (2200K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['accent lamp', 'decorative lamp', 'amber glass', 'walnut base', 'bookshelf light'],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.8, count: 22 }
      },

      // ==========================================
      // LED LIGHTING (32-33)
      // ==========================================
      {
        name: 'Lumina Tunable Linear Ambient LED Bar',
        slug: 'lumina-tunable-linear-ambient-led-bar',
        shortDescription: 'Ultra-slim brushed brass linear luminaire with dual-axis magnetic mount and touch CCT tuning.',
        description:
          'Architectural LED illumination perfected. Encased in extruded satin brass with an opaline diffuser, this magnetic bar can be wall-mounted, placed under shelving, or used as an art picture light with warm white CCT tuning.',
        category: catMap['led-lighting']._id,
        categoryName: 'LED Lighting',
        subcategory: 'Linear Bars',
        price: 6499,
        mrp: 8999,
        discount: 28,
        sku: 'ELQ-LED-LUM-32',
        stock: 19,
        images: [
          'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80',
          '/uploads/hero-slide-1.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Extruded Satin Champagne Brass & Opaline Polycarbonate Diffuser',
          color: 'Champagne Satin Gold',
          dimensions: '60 cm (L) x 4 cm (W) x 2.5 cm (H)',
          weight: '1.2 kg',
          bulbType: 'High-CRI 98+ Tunable White COB LED Array (Integrated)',
          wattage: '16W (2200K - 3500K CCT Tuning)',
          voltage: '220V - 240V AC',
          warranty: '3 Years ELQARA Manufacturer Warranty'
        },
        tags: ['led lighting', 'linear led', 'picture light', 'shelf lighting', 'tunable white'],
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 18 }
      },
      {
        name: 'Strata Minimalist LED Shelf Light',
        slug: 'strata-minimalist-led-shelf-light',
        shortDescription: 'Modular anodized aluminum warm diffused light strip with concealed touch sensor.',
        description:
          'Designed to wash shelving displays, wine racks, and kitchen pantries with quiet, continuous warm lighting without hot-spots or visible diodes. Includes discrete touch controls and dimming memory.',
        category: catMap['led-lighting']._id,
        categoryName: 'LED Lighting',
        subcategory: 'Accent Strips',
        price: 3999,
        mrp: 5499,
        discount: 27,
        sku: 'ELQ-LED-STR-33',
        stock: 26,
        images: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
          '/uploads/hero-slide-2.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Anodized Natural Aluminum & Frosted Diffuser Lens',
          color: 'Matte Natural Aluminum',
          dimensions: '45 cm (L) x 3 cm (W) x 1.8 cm (H)',
          weight: '0.8 kg',
          bulbType: 'Continuous Dotless COB Warm LED Strip (Integrated)',
          wattage: '10W Warm White (2700K)',
          voltage: '220V - 240V AC / USB-C Powered Option',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['shelf light', 'led light', 'under cabinet', 'accent led', 'minimalist lighting'],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.7, count: 25 }
      },

      // ==========================================
      // SMART LIGHTING (34-35)
      // ==========================================
      {
        name: 'Chronos Smart Wireless Charging Lamp',
        slug: 'chronos-smart-wireless-charging-lamp',
        shortDescription: 'Solid Saharanpur walnut smart lamp featuring integrated 15W Qi fast charging & Matter smart control.',
        description:
          'Artisanal natural timber seamlessly integrated with smart connected technology. The base incorporates a fast 15W wireless charging platform for smartphones, while the frosted globe connects to Apple Home, Google Home, and Matter ecosystems.',
        category: catMap['smart-lighting']._id,
        categoryName: 'Smart Lighting',
        subcategory: 'Smart Table Lamps',
        price: 8999,
        mrp: 12499,
        discount: 28,
        sku: 'ELQ-SMT-CHR-34',
        stock: 14,
        images: [
          'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-mushroom-wood.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Seasoned Saharanpur Walnut, Opal Glass Orb, 15W Qi Inductive Pad',
          color: 'Deep Honey Walnut & Matte Opal White',
          dimensions: '22 cm (Dia) x 34 cm (H)',
          weight: '2.5 kg',
          bulbType: 'Matter-Enabled Smart RGBW + Tunable White LED Module',
          wattage: '9W (16 Million Colors + 2000K-6500K CCT)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['smart lamp', 'wireless charger', 'walnut smart light', 'matter compatible', 'bedside smart'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 32 }
      },
      {
        name: 'Iris Smart Ambient Halo Light',
        slug: 'iris-smart-ambient-halo-light',
        shortDescription: 'Spun aluminum smart halo ring with smooth app scheduling, circadian sync, and voice controls.',
        description:
          'Mimics the natural path of daylight through intelligent circadian scheduling. Gradually brightens in gentle morning sunrise hues and dims into relaxing amber fire tones as bedtime approaches.',
        category: catMap['smart-lighting']._id,
        categoryName: 'Smart Lighting',
        subcategory: 'Circadian Lighting',
        price: 7799,
        mrp: 10999,
        discount: 29,
        sku: 'ELQ-SMT-IRI-35',
        stock: 16,
        images: [
          'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-brass-fluted.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Spun Aluminum Ring & Travertine Counterweight Pedestal',
          color: 'Matte Champagne Gold & Travertine Stone',
          dimensions: '30 cm (Dia) x 8 cm (Depth) x 36 cm (H)',
          weight: '3.2 kg',
          bulbType: 'Wi-Fi / Bluetooth Smart Addressable Circadian LED Strip',
          wattage: '12W (2200K - 5000K Tunable White)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['smart halo', 'circadian lighting', 'smart lighting', 'ambient light', 'voice control'],
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.8, count: 15 }
      },

      // ==========================================
      // NIGHT LIGHTS (36-37)
      // ==========================================
      {
        name: 'Nocturne Alabaster Ambient Night Light',
        slug: 'nocturne-alabaster-ambient-night-light',
        shortDescription: 'Solid translucent Spanish alabaster cube casting a soothing 1800K sleep-spectrum glow.',
        description:
          'Carved from a single block of translucent Spanish alabaster. Natural mineral clouds inside the stone glow softly with an ultra-warm amber spectrum that supports melatonin production for restful sleep.',
        category: catMap['night-lights']._id,
        categoryName: 'Night Lights',
        subcategory: 'Alabaster Stone',
        price: 2499,
        mrp: 3499,
        discount: 29,
        sku: 'ELQ-NGH-NOC-36',
        stock: 30,
        images: [
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-travertine-block.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Natural Spanish Alabaster & Solid Brass Base Plate',
          color: 'Translucent Cream Alabaster',
          dimensions: '10 cm (W) x 10 cm (D) x 12 cm (H)',
          weight: '1.4 kg',
          bulbType: 'Low-Lumen Amber Sleep LED (Integrated)',
          wattage: '1.5W Warm Amber (1800K)',
          voltage: '220V - 240V AC / Low Voltage Adapter',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['night light', 'alabaster stone', 'sleep light', 'amber glow', 'nursery lighting'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 44 }
      },
      {
        name: 'Selene Soft Glow Plug-in Night Light',
        slug: 'selene-soft-glow-plug-in-night-light',
        shortDescription: 'Hand-carved Sheesham wood shell plug-in night light with intelligent dusk-to-dawn sensor.',
        description:
          'Features a geometric wooden latticework shade hand-carved in Saharanpur. The integrated ambient sensor turns the subtle downward light on at dusk and off at dawn automatically.',
        category: catMap['night-lights']._id,
        categoryName: 'Night Lights',
        subcategory: 'Plug-in Sensor',
        price: 1999,
        mrp: 2799,
        discount: 29,
        sku: 'ELQ-NGH-SEL-37',
        stock: 35,
        images: [
          '/uploads/prod-mushroom-wood.jpg',
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'
        ],
        thumbnail: '/uploads/prod-mushroom-wood.jpg',
        specifications: {
          material: 'Saharanpur Sheesham Rosewood & Acrylic Diffuser',
          color: 'Natural Warm Rosewood',
          dimensions: '8 cm (W) x 6 cm (D) x 11 cm (H)',
          weight: '0.4 kg',
          bulbType: 'Dusk-to-Dawn Photocell Warm LED',
          wattage: '1W Warm White (2200K)',
          voltage: '220V - 240V Direct Wall Plug',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['night light', 'plug in light', 'sensor light', 'sheesham wood', 'hallway nightlight'],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.8, count: 28 }
      },

      // ==========================================
      // AMBIENT LIGHTING (38-39)
      // ==========================================
      {
        name: 'Pyre Smokeless Glass Candle Lantern',
        slug: 'pyre-smokeless-glass-candle-lantern',
        shortDescription: 'Heavy borosilicate fluted cylinder lantern with magnetic USB-C rechargeable flicker module.',
        description:
          'Recreating the tranquil magic of open flame without smoke or wax mess. The fluted glass cylinder encases a rechargeable micro-LED module with a random algorithmic flicker program.',
        category: catMap['ambient-lighting']._id,
        categoryName: 'Ambient Lighting',
        subcategory: 'Flickering Lanterns',
        price: 3799,
        mrp: 5299,
        discount: 28,
        sku: 'ELQ-AMB-PYR-38',
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-brass-fluted.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Heavy Borosilicate Fluted Glass & Solid Walnut Footing',
          color: 'Amber Tinted Glass & Walnut Base',
          dimensions: '14 cm (Dia) x 24 cm (H)',
          weight: '1.6 kg',
          bulbType: 'USB-C Rechargeable Dynamic Flicker LED (3000mAh Battery)',
          wattage: '3W Candle Flame Warmth (1900K)',
          voltage: '5V USB-C Charging (Up to 48 Hours Runtime)',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['candle lantern', 'ambient lighting', 'rechargeable lamp', 'cordless lamp', 'dining lantern'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 31 }
      },
      {
        name: 'Zephyr Floating Glow Ambient Orb',
        slug: 'zephyr-floating-glow-ambient-orb',
        shortDescription: 'Frosted blown-glass sphere resting delicately in a minimal unlacquered brass tripod stand.',
        description:
          'Simulating a miniature luminous moon gently resting upon brass pins. Perfect for meditation spaces, tea corners, and relaxing living room vignettes.',
        category: catMap['ambient-lighting']._id,
        categoryName: 'Ambient Lighting',
        subcategory: 'Ambient Orbs',
        price: 4299,
        mrp: 5999,
        discount: 28,
        sku: 'ELQ-AMB-ZEP-39',
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
          '/uploads/hero-slide-3.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Hand-Blown Opaline Glass Orb & Solid Cast Brass Tripod',
          color: 'Matte Opal White & Satin Brass',
          dimensions: '20 cm (Dia) x 22 cm (H)',
          weight: '1.7 kg',
          bulbType: 'E14 Warm White Ambient LED Bulb (Included)',
          wattage: '5W Warm White (2400K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['ambient orb', 'glowing sphere', 'mood lighting', 'brass stand', 'ambient lamp'],
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.8, count: 19 }
      },

      // ==========================================
      // CANDLE LAMPS (40-41)
      // ==========================================
      {
        name: 'Ignis Brass Candle Warmer Lamp',
        slug: 'ignis-brass-candle-warmer-lamp',
        shortDescription: 'Thermal radiant halogen candle warmer lamp with heavy travertine stone footing and rotary dimmer.',
        description:
          'Experience your favorite scented jar candles cleanly without flame, smoke, or black soot. The adjustable halogen beam melts the top layer of candle wax from above, distributing pure aromatic fragrance safely throughout your home.',
        category: catMap['candle-lamps']._id,
        categoryName: 'Candle Lamps',
        subcategory: 'Electric Candle Warmers',
        price: 4599,
        mrp: 6499,
        discount: 29,
        sku: 'ELQ-CND-IGN-40',
        stock: 22,
        images: [
          'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-travertine-block.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Spun Brushed Brass Dome, Solid Travertine Stone Base, Brass Dimmer',
          color: 'Warm Beige Travertine & Satin Gold',
          dimensions: '16 cm (W) x 16 cm (D) x 32 cm (H)',
          weight: '3.4 kg',
          bulbType: '2x GU10 50W Thermal Radiant Halogen Bulbs (Included)',
          wattage: '50W Dimmable Thermal Bulb',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['candle warmer', 'candle lamp', 'wax warmer', 'travertine lamp', 'flameless candle'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 36 }
      },
      {
        name: 'Hearth Stone Electric Candle Lamp',
        slug: 'hearth-stone-electric-candle-lamp',
        shortDescription: 'Matte black Marquina stone base with curved arch and stepless fragrance heating timer.',
        description:
          'Engineered with an automatic 2/4/8-hour auto-shutoff timer. Melts scented wax cleanly while casting a cozy radiant pool of light across dressing tables and bedside sanctuaries.',
        category: catMap['candle-lamps']._id,
        categoryName: 'Candle Lamps',
        subcategory: 'Timer Candle Warmers',
        price: 4899,
        mrp: 6899,
        discount: 29,
        sku: 'ELQ-CND-HEA-41',
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-brass-fluted.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Natural Black Marquina Stone Base & Curved Steel Hood',
          color: 'Matte Charcoal & Polished Black Stone',
          dimensions: '15 cm (Dia) x 30 cm (H)',
          weight: '3.1 kg',
          bulbType: 'GU10 35W Radiant Thermal Melting Bulb (2 Included)',
          wattage: '35W Adjustable Heat Output',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['candle warmer', 'electric candle lamp', 'stone base', 'home fragrance'],
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.8, count: 21 }
      },

      // ==========================================
      // LIGHTING ACCESSORIES (42-43)
      // ==========================================
      {
        name: 'Vintage Edison Spiral LED Bulb Pack of 2',
        slug: 'vintage-edison-spiral-led-bulb-pack-of-2',
        shortDescription: 'Pack of 2 teardrop amber glass Edison bulbs with flexible warm spiral LED filaments.',
        description:
          'Replicates historical Victorian incandescent bulbs with ultra-efficient modern LED engineering. Rated for 25,000 hours of flicker-free golden glow, compatible with all standard E27 lamp sockets.',
        category: catMap['lighting-accessories']._id,
        categoryName: 'Lighting Accessories',
        subcategory: 'Filament Bulbs',
        price: 1499,
        mrp: 1999,
        discount: 25,
        sku: 'ELQ-ACC-BUL-42',
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-brass-fluted.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Amber-Tinted Borosilicate Glass & Brass Screw Base',
          color: 'Warm Amber Gold',
          dimensions: '6.4 cm (Dia) x 14.5 cm (H) each',
          weight: '0.2 kg',
          bulbType: 'E27 Screw Base Flexible Spiral Filament LED',
          wattage: '4W LED (Equivalent to 40W Incandescent, 2000K Extra Warm)',
          voltage: '220V - 240V AC (Dimmable)',
          warranty: '1 Year ELQARA Replacement Warranty'
        },
        tags: ['edison bulb', 'vintage bulb', 'spiral filament', 'e27 bulb', 'amber light'],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 58 }
      },
      {
        name: 'Braided Linen Textile Cord & Brass Switch Kit',
        slug: 'braided-linen-textile-cord-brass-switch-kit',
        shortDescription: '3-meter twisted natural flax linen cable with solid brass rotary inline dimmer & socket.',
        description:
          'Upgrade any pendant or table lamp with our artisanal Italian-braided flax cord kit. Features a heavy knurled brass rotary switch that delivers smooth, tactile stepless dimming.',
        category: catMap['lighting-accessories']._id,
        categoryName: 'Lighting Accessories',
        subcategory: 'Cables & Hardware',
        price: 1799,
        mrp: 2499,
        discount: 28,
        sku: 'ELQ-ACC-CRD-43',
        stock: 35,
        images: [
          'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-pendant-woven.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Braided Natural Flax Linen & Heavy Knurled Brass Housing',
          color: 'Natural Oatmeal Flax & Satin Brass',
          dimensions: '3.0 Meters Cable Length with Universal E27 Socket',
          weight: '0.45 kg',
          bulbType: 'Universal E27 Bulb Holder (Rated up to 100W)',
          wattage: 'Stepless Rotary Dimmer Rated to 150W',
          voltage: '220V - 240V AC with 3-Pin Indian Plug',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['lamp cord', 'brass dimmer', 'textile cable', 'lighting accessory', 'diy lighting'],
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.8, count: 24 }
      },

      // ==========================================
      // HOME DECOR (44-46)
      // ==========================================
      {
        name: 'Saharanpur Hand-Carved Sheesham Decor Vessel',
        slug: 'saharanpur-hand-carved-sheesham-decor-vessel',
        shortDescription: 'Solid Indian rosewood fluted bowl with delicate floral brass wire inlay by master artisans.',
        description:
          'Celebrating centuries of Saharanpur woodcarving mastery. Carved from a single block of seasoned Sheesham (Indian Rosewood) with fluted outer scallops and hand-hammered floral brass wire inlay. Ideal as a decorative centerpiece or entryway key bowl.',
        category: catMap['home-decor']._id,
        categoryName: 'Home Decor',
        subcategory: 'Woodwork & Bowls',
        price: 2799,
        mrp: 3999,
        discount: 30,
        sku: 'ELQ-OBJ-SHSH-44',
        stock: 25,
        images: [
          '/uploads/prod-carved-vessel.jpg',
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80'
        ],
        thumbnail: '/uploads/prod-carved-vessel.jpg',
        specifications: {
          material: 'Seasoned Sheesham Wood with Pure Brass Wire Inlay',
          color: 'Deep Honey Rosewood & Golden Brass',
          dimensions: '26 cm (Dia) x 12 cm (H)',
          weight: '1.9 kg',
          bulbType: 'N/A (Artisanal Decor Object)',
          wattage: 'N/A',
          voltage: 'N/A',
          warranty: '1 Year Artisan Craftsmanship Guarantee'
        },
        tags: ['saharanpur', 'wood carving', 'brass inlay', 'sheesham', 'home decor', 'bowl'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 48 }
      },
      {
        name: 'Koto Minimalist Ceramic Ikebana Vase',
        slug: 'koto-minimalist-ceramic-ikebana-vase',
        shortDescription: 'Textured stoneware ceramic vessel with raw mineral ash glaze for dry floral botanicals.',
        description:
          'Embracing the Wabi-Sabi philosophy of natural impermanence. Hand-thrown by master studio potters in heavy stoneware with an earthy speckled ash glaze, sculpted to display dried lotus pods, eucalyptus, and botanical branches.',
        category: catMap['home-decor']._id,
        categoryName: 'Home Decor',
        subcategory: 'Ceramic Objects',
        price: 2299,
        mrp: 3199,
        discount: 28,
        sku: 'ELQ-OBJ-KOT-45',
        stock: 28,
        images: [
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
          '/uploads/prod-ceramic-spherical.jpg'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
        specifications: {
          material: 'Speckled Heavy Stoneware Ceramic with Matte Ash Glaze',
          color: 'Warm Sand & Speckled Clay',
          dimensions: '18 cm (Dia) x 28 cm (H)',
          weight: '2.4 kg',
          bulbType: 'N/A (Floral Ceramic Vessel)',
          wattage: 'N/A',
          voltage: 'N/A',
          warranty: '1 Year Artisan Craftsmanship Guarantee'
        },
        tags: ['ceramic vase', 'ikebana', 'wabi sabi', 'home decor', 'stoneware vessel'],
        featured: false,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.8, count: 26 }
      },
      {
        name: 'Vesper Brutalist Travertine Block Object',
        slug: 'vesper-brutalist-travertine-block-object',
        shortDescription: 'Solid Italian beige travertine stone sculpture functioning as architectural pedestal & bookend.',
        description:
          'Cut from raw Italian beige travertine stone, each monolithic block showcases millions-of-years-old cavities, fossil marks, and mineral veins. Functions as a grounding architectural bookend, paperweight, or display pedestal.',
        category: catMap['home-decor']._id,
        categoryName: 'Home Decor',
        subcategory: 'Stone Sculptures',
        price: 3499,
        mrp: 4899,
        discount: 29,
        sku: 'ELQ-OBJ-VES-46',
        stock: 20,
        images: [
          '/uploads/prod-travertine-block.jpg',
          'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=1000&q=80'
        ],
        thumbnail: '/uploads/prod-travertine-block.jpg',
        specifications: {
          material: 'Quarry-Cut Natural Italian Beige Travertine Stone',
          color: 'Earthy Warm Beige Travertine',
          dimensions: '15 cm (W) x 15 cm (D) x 20 cm (H)',
          weight: '4.9 kg',
          bulbType: 'N/A (Sculptural Stone Object)',
          wattage: 'N/A',
          voltage: 'N/A',
          warranty: 'Lifetime Natural Stone Longevity'
        },
        tags: ['travertine object', 'bookend', 'brutalist', 'stone decor', 'home decor'],
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 19 }
      }
    ];

    let createdProducts = [];
    if (isProduction && !forceReset) {
      let newlyAdded = 0;
      for (const inputProd of productsData) {
        let existing = await Product.findOne({ slug: inputProd.slug });
        if (!existing) {
          existing = await Product.create(inputProd);
          newlyAdded++;
        }
        createdProducts.push(existing);
      }
      console.log(`[Seed] Verified products: ${newlyAdded} new added, ${createdProducts.length} total active`);
    } else {
      createdProducts = await Product.insertMany(productsData);
      console.log(`[Seed] Successfully created ${createdProducts.length} premium products across all 15 categories`);
    }

    // 4. Seed Promotional Coupons
    const couponsData = [
      {
        code: 'WELCOME10',
        description: 'Welcome gift for first-time collectors',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 1999,
        maxDiscount: 1500,
        expiryDate: new Date('2027-12-31'),
        usageLimit: 500,
        isActive: true
      },
      {
        code: 'ELQARA20',
        description: 'Exclusive 20% savings on orders above ₹4,999',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 4999,
        maxDiscount: 2500,
        expiryDate: new Date('2027-12-31'),
        usageLimit: 200,
        isActive: true
      },
      {
        code: 'FESTIVE500',
        description: 'Flat ₹500 discount on your artisanal curation',
        discountType: 'fixed',
        discountValue: 500,
        minOrderValue: 3000,
        expiryDate: new Date('2027-12-31'),
        usageLimit: 300,
        isActive: true
      }
    ];
    if (isProduction && !forceReset) {
      for (const c of couponsData) {
        const existing = await Coupon.findOne({ code: c.code });
        if (!existing) await Coupon.create(c);
      }
      console.log('[Seed] Verified promotional coupons');
    } else {
      await Coupon.insertMany(couponsData);
      console.log('[Seed] Created coupons: WELCOME10, ELQARA20, FESTIVE500');
    }

    const existingHomepage = await Homepage.findOne();
    if (!existingHomepage) {
      await Homepage.create({
        heroSlides: [
          {
            preheading: 'PREMIUM HOME DÉCOR & LIGHTING',
            title: 'Crafted forms.\nConsidered spaces.',
            subtitle: 'Discover handcrafted lighting and décor that brings warmth, character and calm to your space.',
            buttonText: 'EXPLORE COLLECTION',
            buttonLink: '/shop',
            badgeText: 'Handcrafted in India',
            image: '/uploads/hero-slide-1.jpg',
            slideNumber: '01'
          },
          {
            preheading: 'ARCHITECTURAL ILLUMINATION',
            title: 'Subtle warmth.\nTimeless glass.',
            subtitle: 'Fluted amber crystal and brushed brass that infuse every corner with gentle, considered radiance.',
            buttonText: 'DISCOVER LAMPS',
            buttonLink: '/shop?category=table-lamps',
            badgeText: 'Artisanal Brasswork',
            image: '/uploads/hero-slide-2.jpg',
            slideNumber: '02'
          },
          {
            preheading: 'SCULPTURAL LIVING',
            title: 'Graceful arcs.\nEffortless calm.',
            subtitle: 'Elevate expansive living rooms with solid walnut arcs and hand-blown opaline diffusers.',
            buttonText: 'VIEW FLOOR LAMPS',
            buttonLink: '/shop?category=floor-lamps',
            badgeText: 'Artisanal Woodcraft',
            image: '/uploads/hero-slide-3.jpg',
            slideNumber: '03'
          }
        ],
        announcementBar: {
          text: 'Complimentary white-glove shipping on all handcrafted artisanal orders across India',
          enabled: true
        },
        featuredCollectionTitle: 'The Atelier Collection',
        featuredCollectionSubtitle: 'Sculpted by master woodturners and brass artisans.'
      });
      console.log('[Seed] Created default Homepage configuration');
    } else {
      console.log('[Seed] Verified existing Homepage configuration');
    }

    // 6. Seed Sample Orders (Dev/Test only)
    if ((!isProduction || forceReset) && demoCustomer && createdProducts.length >= 5) {
      await Order.create({
      orderNumber: 'ELQ-2026-104829',
      user: demoCustomer._id,
      customer: {
        name: demoCustomer.name,
        email: demoCustomer.email,
        phone: demoCustomer.phone
      },
      shippingAddress: demoCustomer.addresses[0],
      items: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          slug: createdProducts[0].slug,
          price: createdProducts[0].price,
          quantity: 1,
          image: createdProducts[0].thumbnail,
          sku: createdProducts[0].sku
        },
        {
          product: createdProducts[4]._id,
          name: createdProducts[4].name,
          slug: createdProducts[4].slug,
          price: createdProducts[4].price,
          quantity: 1,
          image: createdProducts[4].thumbnail,
          sku: createdProducts[4].sku
        }
      ],
      subtotal: createdProducts[0].price + createdProducts[4].price,
      shippingFee: 0,
      discountAmount: 1199,
      coupon: { code: 'WELCOME10', discount: 1199 },
      totalAmount: createdProducts[0].price + createdProducts[4].price - 1199,
      paymentMethod: 'ONLINE',
      paymentStatus: 'Paid',
      orderStatus: 'Processing',
      statusTimeline: [
        { status: 'Confirmed', note: 'Payment verified via Online Gateway', timestamp: new Date(Date.now() - 86400000) },
        { status: 'Processing', note: 'Artisans packaging lamp in protective wooden crate', timestamp: new Date() }
      ]
    });

    await Order.create({
      orderNumber: 'ELQ-2026-902143',
      user: null,
      customer: {
        name: 'Meera Rajput',
        email: 'meera.rajput@example.com',
        phone: '+91 99887 66554'
      },
      shippingAddress: {
        street: 'Villa 18, Palm Meadows, Whitefield',
        landmark: 'Near Forum Mall',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066',
        country: 'India'
      },
      items: [
        {
          product: createdProducts[1]._id,
          name: createdProducts[1].name,
          slug: createdProducts[1].slug,
          price: createdProducts[1].price,
          quantity: 2,
          image: createdProducts[1].thumbnail,
          sku: createdProducts[1].sku
        }
      ],
      subtotal: createdProducts[1].price * 2,
      shippingFee: 0,
      discountAmount: 500,
      coupon: { code: 'FESTIVE500', discount: 500 },
      totalAmount: createdProducts[1].price * 2 - 500,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      statusTimeline: [
        { status: 'Confirmed', note: 'Order confirmed with customer via phone verification', timestamp: new Date() }
      ]
      });
      console.log('[Seed] Created realistic sample orders for development');
    } else {
      console.log('[Seed Safeguard] Production mode: Real orders preserved without dummy order creation');
    }

    console.log('----------------------------------------------------');
    console.log(isProduction && !forceReset ? 'ELQARA DATABASE SYNC COMPLETED SAFELY (NON-DESTRUCTIVE)' : 'ELQARA DATABASE SEEDED SUCCESSFULLY');
    console.log(`Total Products Verified: ${createdProducts.length}`);
    console.log(`Administrator Status: Verified (${adminEmail})`);
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
