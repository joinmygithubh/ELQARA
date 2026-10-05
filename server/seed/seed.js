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

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/elqara_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB:', mongoUri);

    // Clear existing records
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Coupon.deleteMany({});
    await Homepage.deleteMany({});
    console.log('[Seed] Cleared existing data');

    // 1. Seed Users (Admin & Customer)
    const adminUser = await User.create({
      name: 'ELQARA Administrator',
      email: 'admin@elqara.com',
      password: 'ElqaraAdmin@2026',
      phone: '+91 98765 43210',
      role: 'admin'
    });

    const demoCustomer = await User.create({
      name: 'Arjun Sharma',
      email: 'arjun.sharma@example.com',
      password: 'CustomerPass@123',
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
    console.log('[Seed] Created Admin (admin@elqara.com) and Customer (arjun.sharma@example.com)');

    // 2. Seed Categories
    const categoriesData = [
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
        name: 'Pendant & Ceiling Lights',
        slug: 'pendant-lights',
        description: 'Pleated washi paper, woven bamboo and hand-turned timber hanging pendants casting soothing ambient glow.',
        image: '/uploads/prod-pendant-woven.jpg',
        displayOrder: 3,
        isActive: true
      },
      {
        name: 'Home Decor & Objects',
        slug: 'home-decor',
        description: 'Handcrafted Sheesham wood vessels, stone bowls and decorative curios created by Saharanpur master artisans.',
        image: '/uploads/prod-carved-vessel.jpg',
        displayOrder: 4,
        isActive: true
      },
      {
        name: 'Wall Sconces',
        slug: 'wall-sconces',
        description: 'Minimalist brass sconces providing halo backlighting and subtle textural depth to walls.',
        image: '/uploads/prod-brass-fluted.jpg',
        displayOrder: 5,
        isActive: true
      }
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    categoriesData.forEach((inputCat, idx) => {
      const created = createdCategories[idx];
      catMap[inputCat.slug] = created;
      catMap[created.slug] = created;
      catMap[created.name] = created;
    });
    console.log(`[Seed] Created ${createdCategories.length} categories`);

    // 3. Seed Products
    const productsData = [
      {
        name: 'Komorebi Mushroom Walnut Lamp',
        slug: 'komorebi-mushroom-walnut-lamp',
        shortDescription: 'Sculptural solid walnut table lamp with an organic dome shade emitting a soft, golden downward glow.',
        description:
          'Handcrafted from seasoned Saharanpur walnut timber, the Komorebi table lamp presents an iconic mushroom silhouette with an organic wood grain profile. Its curved dome shade casts a warm, downward ambient glow that celebrates the quiet intimacy of home. Each piece is turned by hand by master craftsmen in Saharanpur, finished with natural organic beeswax and paired with an antique twisted cloth cord.',
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: 'Accent Lighting',
        price: 6499,
        mrp: 8999,
        discount: 28,
        sku: 'ELQ-TBL-MUSH-01',
        stock: 18,
        images: ['/uploads/prod-mushroom-wood.jpg', '/uploads/hero-slide-1.jpg'],
        thumbnail: '/uploads/prod-mushroom-wood.jpg',
        specifications: {
          material: 'Solid Walnut Timber & Aged Brass',
          color: 'Natural Dark Walnut',
          dimensions: '32 cm (D) x 46 cm (H)',
          weight: '2.8 kg',
          bulbType: 'E27 Warm Filament LED (Included)',
          wattage: '8W (2700K Warm Glow)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['walnut', 'mushroom lamp', 'wooden lamp', 'ambient', 'handcrafted', 'table lamp'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 24 }
      },
      {
        name: 'Aura Fluted Amber Glass Lamp',
        slug: 'aura-fluted-amber-glass-lamp',
        shortDescription: 'Cylindrical fluted amber glass with a solid brushed brass frame and exposed warm filament.',
        description:
          'A delicate dialogue between heavy brushed brass and ribbed amber borosilicate glass. The internal vintage filament radiates an inviting golden hue across tables, nightstands, and living room credenzas. Features a tactile brass toggle switch on the base.',
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: 'Glass & Brass',
        price: 5299,
        mrp: 7499,
        discount: 29,
        sku: 'ELQ-TBL-FLUT-02',
        stock: 14,
        images: ['/uploads/prod-brass-fluted.jpg', '/uploads/hero-slide-2.jpg'],
        thumbnail: '/uploads/prod-brass-fluted.jpg',
        specifications: {
          material: 'Brushed Brass & Ribbed Borosilicate Glass',
          color: 'Warm Amber & Satin Gold',
          dimensions: '18 cm (D) x 38 cm (H)',
          weight: '2.1 kg',
          bulbType: 'E27 Vintage Amber Squirrel Cage (Included)',
          wattage: '6W LED Warm White (2200K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['fluted glass', 'brass lamp', 'vintage glow', 'table lamp', 'luxury'],
        featured: true,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.8, count: 18 }
      },
      {
        name: 'Sylvan Arc Walnut & Brass Floor Lamp',
        slug: 'sylvan-arc-walnut-brass-floor-lamp',
        shortDescription: 'Architectural floor lamp featuring a curved steam-bent walnut spine and opaline glass globe.',
        description:
          'An architectural statement piece. A sweeping curved arm combining steam-bent walnut and brushed brass culminates in a hand-blown opaline glass orb diffuser. Weighted brass base ensures steadfast stability while the warm diffused lighting effortlessly elevates reading corners and living rooms.',
        category: catMap['floor-lamps']._id,
        categoryName: 'Floor Lamps',
        subcategory: 'Arc Lamps',
        price: 14999,
        mrp: 19999,
        discount: 25,
        sku: 'ELQ-FLR-ARC-03',
        stock: 8,
        images: ['/uploads/prod-arc-floor.jpg', '/uploads/hero-slide-3.jpg'],
        thumbnail: '/uploads/prod-arc-floor.jpg',
        specifications: {
          material: 'Solid Steam-Bent Walnut & Cast Brass Base',
          color: 'American Walnut & Matte Satin Brass',
          dimensions: '85 cm (W) x 185 cm (H) x 35 cm (Base D)',
          weight: '8.4 kg',
          bulbType: 'E27 Opaline LED Bulb (Included)',
          wattage: '12W Dimmable Warm White (3000K)',
          voltage: '220V - 240V AC',
          warranty: '3 Years ELQARA Manufacturer Warranty'
        },
        tags: ['floor lamp', 'arc lamp', 'statement piece', 'reading lamp', 'living room'],
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 5.0, count: 9 }
      },
      {
        name: 'Calypso Ribbed Ceramic & Pleated Lamp',
        slug: 'calypso-ribbed-ceramic-pleated-lamp',
        shortDescription: 'Hand-thrown textured ceramic spherical base paired with a crisp knife-pleated linen shade.',
        description:
          'Embodying quiet luxury and Scandinavian simplicity. Hand-thrown on the potter’s wheel with an earthy speckled matte glaze, paired with a custom knife-pleat natural linen shade that softly diffuses light upwards and downwards.',
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: 'Ceramic Collection',
        price: 4899,
        mrp: 6999,
        discount: 30,
        sku: 'ELQ-TBL-CRMC-04',
        stock: 22,
        images: ['/uploads/prod-ceramic-spherical.jpg'],
        thumbnail: '/uploads/prod-ceramic-spherical.jpg',
        specifications: {
          material: 'Speckled Stoneware Ceramic & Belgian Linen',
          color: 'Warm Off-White & Natural Oat',
          dimensions: '28 cm (D) x 48 cm (H)',
          weight: '3.2 kg',
          bulbType: 'E27 Warm LED',
          wattage: '9W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['ceramic lamp', 'pleated shade', 'japandi', 'minimalist', 'bedside'],
        featured: true,
        bestSeller: true,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 31 }
      },
      {
        name: 'Origami Woven Washi Paper Pendant',
        slug: 'origami-woven-washi-paper-pendant',
        shortDescription: 'Pleated washi paper ceiling pendant suspended on solid walnut and antique brass hardware.',
        description:
          'A serene luminaire that radiates warmth and tranquil geometry. Inspired by traditional Japanese paper craft and adapted with modern Saharanpur woodwork accents. Suspended from an adjustable textile cord.',
        category: catMap['pendant-lights']._id,
        categoryName: 'Pendant & Ceiling Lights',
        subcategory: 'Hanging Pendants',
        price: 5999,
        mrp: 8499,
        discount: 29,
        sku: 'ELQ-PEN-WSHI-05',
        stock: 12,
        images: ['/uploads/prod-pendant-woven.jpg'],
        thumbnail: '/uploads/prod-pendant-woven.jpg',
        specifications: {
          material: 'Artisanal Washi Paper & Walnut Ring',
          color: 'Soft Ecru & Deep Walnut',
          dimensions: '45 cm (D) x 32 cm (H) with 1.8m Cord',
          weight: '1.4 kg',
          bulbType: 'E27 LED Bulb',
          wattage: '9W Warm Diffused (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['pendant light', 'dining lighting', 'paper lantern', 'wabi sabi'],
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.7, count: 11 }
      },
      {
        name: 'Vesper Brutalist Travertine Block Lamp',
        slug: 'vesper-brutalist-travertine-block-lamp',
        shortDescription: 'Solid natural travertine stone block with an integrated solid brass toggle and opaline orb.',
        description:
          'Cut from raw Italian beige travertine stone, each base displays unique natural cavities and earthy veining. Crowned with an exposed satin brass socket, retro bat-handle toggle switch, and a smooth frosted opaline glass orb.',
        category: catMap['table-lamps']._id,
        categoryName: 'Table Lamps',
        subcategory: 'Stone & Marble',
        price: 4499,
        mrp: 5999,
        discount: 25,
        sku: 'ELQ-TBL-TRVT-06',
        stock: 15,
        images: ['/uploads/prod-travertine-block.jpg'],
        thumbnail: '/uploads/prod-travertine-block.jpg',
        specifications: {
          material: 'Natural Italian Travertine & Solid Brass',
          color: 'Warm Beige Travertine & Satin Brass',
          dimensions: '16 cm (W) x 16 cm (D) x 29 cm (H)',
          weight: '4.6 kg',
          bulbType: 'G9 Frosted Capsule Bulb (Included)',
          wattage: '5W Warm White (2700K)',
          voltage: '220V - 240V AC',
          warranty: '2 Years ELQARA Manufacturer Warranty'
        },
        tags: ['travertine', 'stone lamp', 'brutalist', 'accent light', 'luxury decor'],
        featured: true,
        bestSeller: false,
        newArrival: false,
        status: 'active',
        ratings: { average: 4.9, count: 16 }
      },
      {
        name: 'Saharanpur Hand-Carved Sheesham Decor Vessel',
        slug: 'saharanpur-hand-carved-sheesham-decor-vessel',
        shortDescription: 'Solid Indian rosewood fluted bowl with delicate floral brass wire inlay by master artisans.',
        description:
          'Celebrating centuries of Saharanpur woodcarving mastery. Carved from a single block of seasoned Sheesham (Indian Rosewood) with fluted outer scallops and hand-hammered floral brass wire inlay. Ideal as a decorative centerpiece or entryway key bowl.',
        category: catMap['home-decor']._id,
        categoryName: 'Home Decor & Objects',
        subcategory: 'Woodwork & Bowls',
        price: 2799,
        mrp: 3999,
        discount: 30,
        sku: 'ELQ-OBJ-SHSH-07',
        stock: 25,
        images: ['/uploads/prod-carved-vessel.jpg'],
        thumbnail: '/uploads/prod-carved-vessel.jpg',
        specifications: {
          material: 'Seasoned Sheesham Wood with Pure Brass Wire Inlay',
          color: 'Deep Honey & Golden Brass',
          dimensions: '26 cm (D) x 12 cm (H)',
          weight: '1.9 kg',
          bulbType: 'N/A (Home Decor Object)',
          wattage: 'N/A',
          voltage: 'N/A',
          warranty: '1 Year Artisan Craftsmanship Guarantee'
        },
        tags: ['saharanpur', 'wood carving', 'brass inlay', 'sheesham', 'home decor', 'bowl'],
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'active',
        ratings: { average: 4.9, count: 42 }
      }
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`[Seed] Created ${createdProducts.length} products`);

    // 4. Seed Coupons
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
    await Coupon.insertMany(couponsData);
    console.log('[Seed] Created coupons: WELCOME10, ELQARA20, FESTIVE500');

    // 5. Seed Homepage Settings
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
          badgeText: 'Saharanpur Craft',
          image: '/uploads/hero-slide-3.jpg',
          slideNumber: '03'
        }
      ],
      announcementBar: {
        text: 'Complimentary white-glove shipping on all handcrafted artisanal orders across India',
        enabled: true
      },
      featuredCollectionTitle: 'The Saharanpur Heritage',
      featuredCollectionSubtitle: 'Sculpted by generational woodturners and brass artisans in Uttar Pradesh.'
    });
    console.log('[Seed] Created default Homepage configuration');

    // 6. Seed Sample Orders for Admin Dashboard Realism
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
          product: createdProducts[6]._id,
          name: createdProducts[6].name,
          slug: createdProducts[6].slug,
          price: createdProducts[6].price,
          quantity: 1,
          image: createdProducts[6].thumbnail,
          sku: createdProducts[6].sku
        }
      ],
      subtotal: 9298,
      shippingFee: 0,
      discountAmount: 929,
      coupon: { code: 'WELCOME10', discount: 929 },
      totalAmount: 8369,
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
      subtotal: 10598,
      shippingFee: 0,
      discountAmount: 500,
      coupon: { code: 'FESTIVE500', discount: 500 },
      totalAmount: 10098,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      statusTimeline: [
        { status: 'Confirmed', note: 'Order confirmed with customer via phone verification', timestamp: new Date() }
      ]
    });

    console.log('[Seed] Created sample orders');
    console.log('----------------------------------------------------');
    console.log('ELQARA DATABASE SEEDED SUCCESSFULLY!');
    console.log('Admin Login: admin@elqara.com / ElqaraAdmin@2026');
    console.log('Customer Login: arjun.sharma@example.com / CustomerPass@123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
