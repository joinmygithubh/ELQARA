import express from 'express';
import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry
} from '../controllers/enquiryController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Cloudflare Worker & Node compatible in-memory rate limiter (avoids global scope setInterval)
const submissionTracker = new Map();
const enquirySubmitLimiter = (req, res, next) => {
  try {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxRequests = 15;
    const ip = req.headers['cf-connecting-ip'] ||
               req.headers['x-forwarded-for']?.split(',')[0].trim() ||
               req.ip ||
               req.socket?.remoteAddress ||
               'client-ip';

    // Lazy cleanup of expired entries during requests
    if (submissionTracker.size > 500) {
      for (const [key, val] of submissionTracker.entries()) {
        if (now - val.startTime > windowMs) {
          submissionTracker.delete(key);
        }
      }
    }

    const current = submissionTracker.get(ip);
    if (!current || (now - current.startTime > windowMs)) {
      submissionTracker.set(ip, { count: 1, startTime: now });
      return next();
    }

    if (current.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many enquiries submitted from this network. Please wait a few minutes before submitting again.'
      });
    }

    current.count += 1;
    next();
  } catch {
    next();
  }
};

// Public customer submission route
router.post('/', enquirySubmitLimiter, createEnquiry);

// Protected Admin management routes
router.get('/admin/all', protect, adminOnly, getAllEnquiries);
router.get('/:id', protect, adminOnly, getEnquiryById);
router.patch('/:id/status', protect, adminOnly, updateEnquiryStatus);
router.delete('/:id', protect, adminOnly, deleteEnquiry);

export default router;
