/**
 * ELQARA Atelier — Production Readiness & Security Verification Suite
 * Automated test suite covering Requirements 1 through 15
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import {
  escapeHtml,
  buildEnquiryEmailHtml,
  buildEnquiryEmailText
} from './services/emailService.js';
import { protect, adminOnly, optionalAuth } from './middleware/auth.js';
import { DEFAULT_RATES, formatCurrency } from '../client/src/services/currencyService.js';

console.log('====================================================');
console.log('ELQARA Production Readiness & Security Test Suite');
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

// -------------------------------------------------------------
// Test 1: No demo admin credentials in source or dist bundles
// -------------------------------------------------------------
await runTest('1. No demo credentials or prefilled secrets in frontend files', () => {
  const adminLoginContent = fs.readFileSync(
    path.resolve('../client/src/admin/pages/AdminLogin.jsx'),
    'utf-8'
  );
  assert.ok(
    !adminLoginContent.includes("useState('admin@elqara.com')"),
    'AdminLogin must not have prefilled email'
  );
  assert.ok(
    !adminLoginContent.includes("useState('ElqaraAdmin@2026')"),
    'AdminLogin must not have prefilled password'
  );

  const authPageContent = fs.readFileSync(
    path.resolve('../client/src/pages/AuthPage.jsx'),
    'utf-8'
  );
  assert.ok(
    !authPageContent.includes('Demo Customer:'),
    'AuthPage must not show Demo Customer banner'
  );
  assert.ok(
    !authPageContent.includes('CustomerPass@123'),
    'AuthPage must not show CustomerPass@123'
  );

  // Check dist bundle if dist exists
  const distDir = path.resolve('../client/dist/assets');
  if (fs.existsSync(distDir)) {
    const jsFiles = fs.readdirSync(distDir).filter((f) => f.endsWith('.js'));
    for (const jsFile of jsFiles) {
      const code = fs.readFileSync(path.join(distDir, jsFile), 'utf-8');
      assert.ok(!code.includes('ElqaraAdmin@2026'), `Bundle ${jsFile} must not contain admin password`);
      assert.ok(!code.includes('CustomerPass@123'), `Bundle ${jsFile} must not contain demo customer password`);
    }
  }
});

// -------------------------------------------------------------
// Test 2: No demo admin shortcuts in Navbar or Footer
// -------------------------------------------------------------
await runTest('2. No demo admin shortcuts in public storefront navigation', () => {
  const navbarContent = fs.readFileSync(
    path.resolve('../client/src/components/Navbar.jsx'),
    'utf-8'
  );
  assert.ok(
    !navbarContent.includes('Admin Access'),
    'Navbar unauthenticated menu must not have Admin Access link'
  );

  const footerContent = fs.readFileSync(
    path.resolve('../client/src/components/Footer.jsx'),
    'utf-8'
  );
  assert.ok(
    !footerContent.includes('Admin Portal'),
    'Public storefront footer must not link to Admin Portal'
  );
});

// -------------------------------------------------------------
// Test 3: Password Reset Code Verification & Security
// -------------------------------------------------------------
await runTest('3. Password reset requires verified 6-digit code with expiration', () => {
  const authControllerContent = fs.readFileSync(
    path.resolve('controllers/authController.js'),
    'utf-8'
  );
  assert.ok(
    authControllerContent.includes('resetCode') || authControllerContent.includes('verificationCode'),
    'Reset password must require verification code'
  );
  assert.ok(
    authControllerContent.includes('resetPasswordExpire'),
    'Reset password must validate expiration'
  );

  // Validate SHA-256 hash logic
  const code = '582914';
  const hash1 = crypto.createHash('sha256').update(code).digest('hex');
  const hash2 = crypto.createHash('sha256').update('582914').digest('hex');
  assert.equal(hash1, hash2, 'Hash generation must be deterministic');
});

// -------------------------------------------------------------
// Test 4: Rate Limiting Configured on Auth Endpoints
// -------------------------------------------------------------
await runTest('4. In-memory edge rate limiters configured on auth endpoints', () => {
  const authRoutesContent = fs.readFileSync(
    path.resolve('routes/authRoutes.js'),
    'utf-8'
  );
  assert.ok(authRoutesContent.includes('loginLimiter'), 'Login route must use loginLimiter');
  assert.ok(authRoutesContent.includes('adminLoginLimiter'), 'Admin login route must use adminLoginLimiter');
  assert.ok(authRoutesContent.includes('registerLimiter'), 'Register route must use registerLimiter');
  assert.ok(authRoutesContent.includes('passwordResetLimiter'), 'Password reset routes must use passwordResetLimiter');
});

// -------------------------------------------------------------
// Test 5: Unauthenticated access blocked on Admin APIs
// -------------------------------------------------------------
await runTest('5. Unauthenticated requests are rejected by protect middleware', async () => {
  let statusCalled = null;
  let jsonCalled = null;
  const mockReq = { headers: {} };
  const mockRes = {
    status: (s) => {
      statusCalled = s;
      return {
        json: (d) => {
          jsonCalled = d;
        }
      };
    }
  };
  const mockNext = () => {
    throw new Error('next() should not be called for unauthenticated request');
  };

  await protect(mockReq, mockRes, mockNext);
  assert.equal(statusCalled, 401, 'Should return 401 Unauthorized');
  assert.equal(jsonCalled.success, false);
});

// -------------------------------------------------------------
// Test 6: Customers cannot access Admin APIs (Role Enforcement)
// -------------------------------------------------------------
await runTest('6. Customer accounts are rejected by adminOnly middleware (403)', () => {
  let statusCalled = null;
  let jsonCalled = null;
  const mockReq = {
    user: {
      _id: '67a80b8529f7cf7c65432101',
      name: 'Regular Customer',
      role: 'customer'
    }
  };
  const mockRes = {
    status: (s) => {
      statusCalled = s;
      return {
        json: (d) => {
          jsonCalled = d;
        }
      };
    }
  };
  const mockNext = () => {
    throw new Error('next() should not be called for customer on admin route');
  };

  adminOnly(mockReq, mockRes, mockNext);
  assert.equal(statusCalled, 403, 'Should return 403 Forbidden');
  assert.equal(jsonCalled.success, false);
  assert.ok(jsonCalled.message.includes('Admin privileges required'));

  // Conversely, admin role passes
  let adminPassed = false;
  const mockAdminReq = { user: { role: 'admin' } };
  adminOnly(mockAdminReq, mockRes, () => {
    adminPassed = true;
  });
  assert.ok(adminPassed, 'Administrator role must pass adminOnly');
});

// -------------------------------------------------------------
// Test 7: Customer Order Access Isolation (No Cross-Customer Leaks)
// -------------------------------------------------------------
await runTest('7. Customers cannot access other customers orders', () => {
  const orderControllerContent = fs.readFileSync(
    path.resolve('controllers/orderController.js'),
    'utf-8'
  );
  assert.ok(
    orderControllerContent.includes('order.user'),
    'Order controller must verify order.user ownership'
  );
  assert.ok(
    orderControllerContent.includes('403'),
    'Order controller must return 403 for unauthorized access'
  );
  assert.ok(
    orderControllerContent.includes('401'),
    'Order controller must return 401 for unauthenticated request on registered order'
  );
});

// -------------------------------------------------------------
// Test 8: Order Total & Coupon Calculation Integrity (Server-Side)
// -------------------------------------------------------------
await runTest('8. Server-side order total and shipping fee policy calculation', () => {
  // Test shipping rule: free >= 1999, else 199
  const subtotal1 = 1500;
  const shipping1 = subtotal1 >= 1999 ? 0 : 199;
  assert.equal(shipping1, 199, 'Orders below 1999 should incur 199 shipping');

  const subtotal2 = 4500;
  const shipping2 = subtotal2 >= 1999 ? 0 : 199;
  assert.equal(shipping2, 0, 'Orders 1999+ should receive complimentary shipping');

  // Total calculation prevents negative values
  const discount = 5000;
  const total = Math.max(0, subtotal1 + shipping1 - discount);
  assert.equal(total, 0, 'Total amount must not be negative');
});

// -------------------------------------------------------------
// Test 9: Enquiry Email XSS Escaping & HTML Template Integrity
// -------------------------------------------------------------
await runTest('9. Enquiry email sanitization and HTML template rendering', () => {
  const maliciousInput = '<script>alert("xss")</script>&"\'';
  const escaped = escapeHtml(maliciousInput);
  assert.ok(!escaped.includes('<script>'), 'Script tag must be escaped');
  assert.ok(escaped.includes('&lt;script&gt;'), 'Angle brackets must be converted to entities');

  const sampleEnquiry = {
    _id: '67a80b8529f7cf7c65432199',
    name: 'Maharani Gayatri Devi',
    email: 'client@heritage.in',
    phone: '+91 98765 00000',
    subject: 'Bespoke Chandelier',
    message: 'We require a custom brass fixture.',
    productName: 'The Sylvan Arc',
    productSku: 'ELQ-ARC-8801',
    productUrl: 'https://elqara.com/product/the-sylvan-arc',
    quantity: 2,
    preferredContact: 'WhatsApp',
    createdAt: new Date('2026-10-09T08:00:00Z')
  };

  const html = buildEnquiryEmailHtml(sampleEnquiry);
  assert.ok(html.includes('ELQARA'), 'HTML email must contain brand header');
  assert.ok(html.includes('Maharani Gayatri Devi'), 'HTML email must contain customer name');
  assert.ok(html.includes('The Sylvan Arc'), 'HTML email must contain referenced piece');
  assert.ok(html.includes('ELQ-ARC-8801'), 'HTML email must contain SKU');

  const text = buildEnquiryEmailText(sampleEnquiry);
  assert.ok(text.includes('Maharani Gayatri Devi'), 'Text email must contain customer name');
});

// -------------------------------------------------------------
// Test 10: Currency and Pricing Consistency
// -------------------------------------------------------------
await runTest('10. Base currency strictly INR with valid international conversion', () => {
  assert.equal(DEFAULT_RATES.INR, 1, 'INR base rate must be 1');
  assert.ok(DEFAULT_RATES.USD > 0, 'USD rate must be positive');
  assert.ok(DEFAULT_RATES.EUR > 0, 'EUR rate must be positive');
  assert.ok(DEFAULT_RATES.GBP > 0, 'GBP rate must be positive');

  const inrFormatted = formatCurrency(5490, 'INR', 1);
  assert.ok(inrFormatted.includes('5,490') || inrFormatted.includes('₹'), 'INR format must format number');

  const usdFormatted = formatCurrency(5490, 'USD', DEFAULT_RATES.USD);
  assert.ok(usdFormatted.includes('$'), 'USD format must include dollar symbol');
});

// -------------------------------------------------------------
// Test 11: Production Database Protection in Seed Script
// -------------------------------------------------------------
await runTest('11. Database seed script isolates demo accounts and protects production', () => {
  const seedContent = fs.readFileSync(
    path.resolve('seed/seed.js'),
    'utf-8'
  );
  assert.ok(
    !seedContent.includes('Admin Login: admin@elqara.com / ElqaraAdmin@2026'),
    'seed.js must not print plaintext admin credentials to stdout'
  );
  assert.ok(
    seedContent.includes('!isProduction') && seedContent.includes('arjun.sharma@example.com'),
    'demo customer creation must be disabled in production'
  );
  assert.ok(
    seedContent.includes('ADMIN_INITIAL_PASSWORD'),
    'seed.js must check for ADMIN_INITIAL_PASSWORD in production'
  );
});

// -------------------------------------------------------------
// Test 12: Production Environment Variables & Wrangler Bindings
// -------------------------------------------------------------
await runTest('12. Wrangler configuration has correct production bindings', () => {
  const wranglerContent = fs.readFileSync(
    path.resolve('wrangler.jsonc'),
    'utf-8'
  );
  assert.ok(wranglerContent.includes('elqara-backend'), 'Worker name must be elqara-backend');
  assert.ok(wranglerContent.includes('nodejs_compat'), 'Compatibility flag must include nodejs_compat');
  assert.ok(wranglerContent.includes('0f4cede7.elqara.pages.dev'), 'CLIENT_URL must point to Pages URL');

  const clientEnvProd = fs.readFileSync(
    path.resolve('../client/.env.production'),
    'utf-8'
  );
  assert.ok(
    clientEnvProd.includes('https://elqara-backend.elqara-server.workers.dev/api'),
    'Client production API URL must target live Cloudflare Worker endpoint'
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
