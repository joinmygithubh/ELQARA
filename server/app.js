import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import homepageRoutes from './routes/homepageRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import currencyRoutes from './routes/currencyRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';

import { notFound, errorHandler } from './middleware/errorHandler.js';


const app = express();

// Trust Cloudflare and reverse proxies for client IP detection
app.set('trust proxy', true);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Production and local development allowed CORS origins
const allowedOrigins = [
  'https://0f4cede7.elqara.pages.dev',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.elqara.pages.dev') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'cf-ipcountry', 'x-country-code']
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`[${req.method}] ${req.originalUrl || req.url} ${res.statusCode} (${Date.now() - start}ms)`);
    });
    next();
  });
}

// Serve uploaded assets statically if local uploads directory exists
try {
  if (typeof import.meta?.url === 'string' && fs.existsSync) {
    const localDir = path.dirname(fileURLToPath(import.meta.url));
    const localUploadsPath = path.join(localDir, 'uploads');
    if (fs.existsSync(localUploadsPath)) {
      app.use('/uploads', express.static(localUploadsPath));
    }
  }
} catch (e) {
  // Ignore in environments without local disk
}

// Root Health Check (ensures DB connectivity check, reports accurate status)
app.get('/api/health', async (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  let state = 0;
  try {
    const conn = await connectDB();
    const mg = mongoose?.default?.connection ? mongoose.default : (mongoose?.connection ? mongoose : mongoose?.default || mongoose);
    state = conn?.readyState ?? (mg?.connection?.readyState ?? (mg?.readyState ?? 0));
  } catch (err) {
    console.warn('[Health Check DB Ping Warning]:', err.message);
  }
  const dbStatus = dbStates[state] || 'unknown';

  res.json({
    status: 'online',
    brand: 'ELQARA — Objects for Living',
    runtime: 'Cloudflare Workers / Express',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Database connection guarantee middleware for API operations
app.use(async (req, res, next) => {
  // Health check has already responded above
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('[Database Middleware Error]:', error.message);
    res.status(503).json({
      success: false,
      message: 'Database service temporarily unavailable. Please retry.'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/enquiries', enquiryRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
