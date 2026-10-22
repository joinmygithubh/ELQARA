import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import orderRoutes from './routes/orderRoutes.js';
import { protect } from './middleware/auth.js';

console.log('====================================================');
console.log('ELQARA Login-Gated Ordering & Shimmer Test Suite');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

const runTest = async (name, testFn) => {
  try {
    await testFn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    failedTests++;
  }
};

// 1. Backend Route Protection Verification
await runTest('1. Order creation route enforces protect middleware', () => {
  const routesContent = fs.readFileSync(path.resolve('routes/orderRoutes.js'), 'utf-8');
  assert.ok(
    routesContent.includes("router.post('/', protect, createOrder)"),
    'POST / route must use protect middleware'
  );
  assert.ok(
    !routesContent.includes("router.post('/', optionalAuth, createOrder)"),
    'POST / route must not use optionalAuth'
  );
});

// 2. Backend 401 Rejection on unauthenticated order request
await runTest('2. Unauthenticated order requests are rejected with 401 and concise JSON', async () => {
  let statusResult = null;
  let jsonResult = null;
  const mockReq = { headers: {} };
  const mockRes = {
    status: (code) => {
      statusResult = code;
      return {
        json: (data) => {
          jsonResult = data;
        }
      };
    }
  };
  const mockNext = () => {
    throw new Error('next() must not be called when unauthenticated');
  };

  await protect(mockReq, mockRes, mockNext);
  assert.equal(statusResult, 401, 'Must return HTTP 401');
  assert.equal(jsonResult.success, false);
  assert.equal(jsonResult.message, 'Not authorized, no token provided');
});

// 3. Frontend LoginRequiredModal Message & Actions
await runTest('3. LoginRequiredModal contains exact required message and actions', () => {
  const modalContent = fs.readFileSync(path.resolve('../client/src/components/LoginRequiredModal.jsx'), 'utf-8');
  assert.ok(
    modalContent.includes('You need to log in to buy products.'),
    'Modal must display "You need to log in to buy products."'
  );
  assert.ok(
    modalContent.includes('<span>Login</span>') || modalContent.includes('>Login<'),
    'Modal must provide Login action'
  );
  assert.ok(
    modalContent.includes('<span>Continue Shopping</span>') || modalContent.includes('>Continue Shopping<'),
    'Modal must provide Continue Shopping action'
  );
  assert.ok(
    modalContent.includes("state: { from: returnUrl }"),
    'Login action must pass returnUrl in state'
  );
});

// 4. Frontend Purchase Entry Points consistently gated
await runTest('4. All purchase entry points check authentication and open auth modal', () => {
  // ProductCard
  const cardContent = fs.readFileSync(path.resolve('../client/src/components/ProductCard.jsx'), 'utf-8');
  assert.ok(
    cardContent.includes('!isAuthenticated') && cardContent.includes('openAuthModal'),
    'ProductCard must check auth on Add to Bag'
  );

  // ProductDetailPage
  const detailContent = fs.readFileSync(path.resolve('../client/src/pages/ProductDetailPage.jsx'), 'utf-8');
  assert.ok(
    detailContent.includes('handleAddToCart') && detailContent.includes('openAuthModal(location.pathname)'),
    'ProductDetailPage handleAddToCart must prompt auth with location.pathname'
  );
  assert.ok(
    detailContent.includes('handleBuyNow') && detailContent.includes("openAuthModal('/checkout')"),
    'ProductDetailPage handleBuyNow must prompt auth with /checkout'
  );

  // QuickViewModal
  const quickViewContent = fs.readFileSync(path.resolve('../client/src/components/QuickViewModal.jsx'), 'utf-8');
  assert.ok(
    quickViewContent.includes('!isAuthenticated') && quickViewContent.includes('openAuthModal'),
    'QuickViewModal must check auth on Add to Bag'
  );

  // WishlistPage & WishlistDrawer
  const wishlistPageContent = fs.readFileSync(path.resolve('../client/src/pages/WishlistPage.jsx'), 'utf-8');
  assert.ok(
    wishlistPageContent.includes('!isAuthenticated') && wishlistPageContent.includes("openAuthModal('/wishlist')"),
    'WishlistPage must check auth on Move to Cart'
  );
  const wishlistDrawerContent = fs.readFileSync(path.resolve('../client/src/components/WishlistDrawer.jsx'), 'utf-8');
  assert.ok(
    wishlistDrawerContent.includes('!isAuthenticated') && wishlistDrawerContent.includes("openAuthModal('/wishlist')"),
    'WishlistDrawer must check auth on Move to Cart'
  );

  // CartDrawer & CartPage
  const cartDrawerContent = fs.readFileSync(path.resolve('../client/src/components/CartDrawer.jsx'), 'utf-8');
  assert.ok(
    cartDrawerContent.includes('!isAuthenticated') && cartDrawerContent.includes("openAuthModal('/checkout')"),
    'CartDrawer must check auth on checkout'
  );
  const cartPageContent = fs.readFileSync(path.resolve('../client/src/pages/CartPage.jsx'), 'utf-8');
  assert.ok(
    cartPageContent.includes('!isAuthenticated') && cartPageContent.includes("openAuthModal('/checkout')"),
    'CartPage must check auth on checkout'
  );

  // CheckoutPage
  const checkoutPageContent = fs.readFileSync(path.resolve('../client/src/pages/CheckoutPage.jsx'), 'utf-8');
  assert.ok(
    checkoutPageContent.includes('You need to log in to buy products.'),
    'CheckoutPage must display login required message when unauthenticated'
  );
  assert.ok(
    checkoutPageContent.includes("navigate('/login', { state: { from: '/checkout' } })"),
    'CheckoutPage must offer login redirect to /checkout'
  );
  assert.ok(
    checkoutPageContent.includes("navigate('/shop')"),
    'CheckoutPage must offer Continue Shopping redirect'
  );
  assert.ok(
    checkoutPageContent.includes('handlePlaceOrder') && checkoutPageContent.includes('!isAuthenticated'),
    'CheckoutPage handlePlaceOrder must reject unauthenticated submission'
  );
});

// 5. Frontend Return Navigation on Login
await runTest('5. AuthPage accurately redirects back to intended return URL', () => {
  const authPageContent = fs.readFileSync(path.resolve('../client/src/pages/AuthPage.jsx'), 'utf-8');
  assert.ok(
    authPageContent.includes("typeof location.state?.from === 'string'"),
    'AuthPage must handle string from state'
  );
  assert.ok(
    authPageContent.includes('navigate(from, { replace: true })'),
    'AuthPage must navigate to from on login and register'
  );
});

// 6. Shimmer Loading & prefers-reduced-motion
await runTest('6. Shimmer CSS uses gradients, animation, and respects prefers-reduced-motion', () => {
  const cssContent = fs.readFileSync(path.resolve('../client/src/styles/index.css'), 'utf-8');
  assert.ok(cssContent.includes('@keyframes elqaraShimmer'), 'Must define elqaraShimmer keyframes');
  assert.ok(cssContent.includes('.shimmer-box'), 'Must define .shimmer-box');
  assert.ok(cssContent.includes('.btn-shimmer'), 'Must define .btn-shimmer');
  assert.ok(cssContent.includes('prefers-reduced-motion'), 'Must include prefers-reduced-motion media query');
  assert.ok(
    cssContent.includes('animation: none'),
    'Must disable animation under prefers-reduced-motion'
  );
});

// 7. Shimmer on Login Button & Product Loading
await runTest('7. Shimmer loading applied to login buttons and product loading states', () => {
  const authPageContent = fs.readFileSync(path.resolve('../client/src/pages/AuthPage.jsx'), 'utf-8');
  assert.ok(
    authPageContent.includes("btn-shimmer"),
    'AuthPage submit button must use btn-shimmer during loading'
  );
  assert.ok(
    authPageContent.includes('disabled={loading}'),
    'AuthPage button must be disabled during loading to prevent duplicate submissions'
  );

  const adminLoginContent = fs.readFileSync(path.resolve('../client/src/admin/pages/AdminLogin.jsx'), 'utf-8');
  assert.ok(
    adminLoginContent.includes("btn-shimmer"),
    'AdminLogin button must use btn-shimmer during loading'
  );
  assert.ok(
    adminLoginContent.includes('disabled={loading}'),
    'AdminLogin button must be disabled during loading to prevent duplicate submissions'
  );

  const shopPageContent = fs.readFileSync(path.resolve('../client/src/pages/ShopPage.jsx'), 'utf-8');
  assert.ok(
    shopPageContent.includes('ProductCardSkeleton'),
    'ShopPage must render ProductCardSkeleton when loading'
  );

  const homePageContent = fs.readFileSync(path.resolve('../client/src/pages/HomePage.jsx'), 'utf-8');
  assert.ok(
    homePageContent.includes('ProductCardSkeleton'),
    'HomePage must render ProductCardSkeleton when loading'
  );

  const detailContent = fs.readFileSync(path.resolve('../client/src/pages/ProductDetailPage.jsx'), 'utf-8');
  assert.ok(
    detailContent.includes('shimmer-box'),
    'ProductDetailPage must render shimmer skeleton when loading'
  );
});

console.log('\n====================================================');
console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
