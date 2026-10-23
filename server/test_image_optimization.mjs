import assert from 'node:assert';
import {
  getOptimizedImageUrl,
  getProductImageUrl,
  getImageSrcSet,
  handleImageError,
  FALLBACK_PRODUCT_IMAGE
} from '../client/src/utils/imageUrl.js';

console.log('--- Testing ELQARA Image Optimization Utility ---');

// 1. Missing, Null, Undefined, Invalid values
assert.strictEqual(getOptimizedImageUrl(null), FALLBACK_PRODUCT_IMAGE);
assert.strictEqual(getOptimizedImageUrl(undefined), FALLBACK_PRODUCT_IMAGE);
assert.strictEqual(getOptimizedImageUrl(''), FALLBACK_PRODUCT_IMAGE);
assert.strictEqual(getOptimizedImageUrl('   '), FALLBACK_PRODUCT_IMAGE);
assert.strictEqual(getOptimizedImageUrl('null'), FALLBACK_PRODUCT_IMAGE);
assert.strictEqual(getOptimizedImageUrl('undefined'), FALLBACK_PRODUCT_IMAGE);
console.log('✔ Test 1: Null / Undefined / Invalid values return fallback correctly');

// 2. Unsplash URL Optimization
const unsplashRaw = 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80';
const unsplashOptimized = getOptimizedImageUrl(unsplashRaw, { width: 400, quality: 75 });
assert.ok(unsplashOptimized.includes('w=400'), 'Should contain w=400');
assert.ok(unsplashOptimized.includes('q=75'), 'Should contain q=75');
assert.ok(unsplashOptimized.includes('auto=format'), 'Should contain auto=format');
assert.ok(!unsplashOptimized.startsWith('https://elqara.in'), 'Never prefix absolute URL with domain');
console.log('✔ Test 2: Unsplash URLs downscaled and auto-formatted without domain duplication');

// 3. Cloudinary URL Optimization
const cloudRaw = 'https://res.cloudinary.com/diqptk9al/image/upload/v172812345/elqara_products/sol-lamp.jpg';
const cloudOptimized = getOptimizedImageUrl(cloudRaw, { width: 450 });
assert.strictEqual(
  cloudOptimized,
  'https://res.cloudinary.com/diqptk9al/image/upload/f_auto,q_auto,w_450,c_limit/v172812345/elqara_products/sol-lamp.jpg'
);
assert.ok(!cloudOptimized.startsWith('https://elqara.in'), 'Never prefix absolute Cloudinary URL with domain');
console.log('✔ Test 3: Cloudinary URLs automatically inject modern f_auto,q_auto,w_450,c_limit');

// 4. Local /uploads/ Catalog Products: Thumbnail vs Full View
const localCatalogJpg = '/uploads/products/sol/main.jpg';
const localThumb = getOptimizedImageUrl(localCatalogJpg, { width: 400, isThumbnail: true });
assert.strictEqual(localThumb, '/uploads/products/sol/main-thumb.webp');

const localFull = getOptimizedImageUrl(localCatalogJpg, { width: 900 });
assert.strictEqual(localFull, '/uploads/products/sol/main-full.webp');
console.log('✔ Test 4: Local catalog products correctly negotiate main-thumb.webp vs main-full.webp');

// 5. Local /uploads/ Root Products: Thumbnail vs Full View
const localProdJpg = '/uploads/prod-mushroom-wood.jpg';
const localProdThumb = getOptimizedImageUrl(localProdJpg, { width: 450 });
assert.strictEqual(localProdThumb, '/uploads/prod-mushroom-wood-thumb.webp');

const localProdFull = getOptimizedImageUrl(localProdJpg, { width: 1000 });
assert.strictEqual(localProdFull, '/uploads/prod-mushroom-wood.webp');
console.log('✔ Test 5: Local root products correctly negotiate -thumb.webp vs .webp');

// 6. Missing leading slash normalization
const relativeNoSlash = 'uploads/products/bead/main.jpg';
assert.strictEqual(
  getOptimizedImageUrl(relativeNoSlash, { width: 400 }),
  '/uploads/products/bead/main-thumb.webp'
);
console.log('✔ Test 6: Relative uploads missing leading slash are properly normalized');

// 7. Product Object Resolution with WebP Preference
const mockProduct = {
  name: 'Sol Lamp',
  thumbnail: '/uploads/products/sol/main.jpg',
  images: [
    '/uploads/products/sol/main.jpg',
    '/uploads/products/sol/main-full.webp'
  ]
};
const resolvedProductThumb = getProductImageUrl(mockProduct, { width: 400, isThumbnail: true });
assert.strictEqual(resolvedProductThumb, '/uploads/products/sol/main-thumb.webp');

const resolvedProductFull = getProductImageUrl(mockProduct, { width: 900 });
assert.strictEqual(resolvedProductFull, '/uploads/products/sol/main-full.webp');
console.log('✔ Test 7: getProductImageUrl selects optimal variant from product object');

// 8. Responsive srcSet Generation
const srcSet = getImageSrcSet(unsplashRaw, [360, 640]);
assert.ok(srcSet.includes('360w'), 'Should contain 360w');
assert.ok(srcSet.includes('640w'), 'Should contain 640w');
console.log('✔ Test 8: getImageSrcSet produces valid responsive srcset');

// 9. Error Handler Fallback and Infinite Loop Prevention
const mockImgEl = {
  dataset: {},
  src: 'https://broken.example.com/invalid.jpg',
  onerror: () => {}
};
const mockEvent = { currentTarget: mockImgEl };

// First error triggers fallback
handleImageError(mockEvent, FALLBACK_PRODUCT_IMAGE);
assert.strictEqual(mockImgEl.src, FALLBACK_PRODUCT_IMAGE);
assert.strictEqual(mockImgEl.dataset.fallbackApplied, 'true');
assert.strictEqual(mockImgEl.onerror, null);

// Second error (e.g. if fallback somehow failed) does NOT re-trigger or infinite loop
mockImgEl.src = 'changed';
handleImageError(mockEvent, FALLBACK_PRODUCT_IMAGE);
assert.strictEqual(mockImgEl.src, 'changed', 'Should not re-apply when fallbackApplied is set');
console.log('✔ Test 9: handleImageError guards against infinite retry loops');

console.log('\nAll 9 Image Optimization Tests PASSED successfully!');
