import express from 'express';
import {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Cloudflare Workers and Node.js compatible in-memory rate limiter
const createRateLimiter = ({ windowMs, maxRequests, message }) => {
  const tracker = new Map();
  return (req, res, next) => {
    try {
      const now = Date.now();
      const ip =
        req.headers['cf-connecting-ip'] ||
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.ip ||
        req.socket?.remoteAddress ||
        'client-ip';

      // Lazy cleanup when tracker grows
      if (tracker.size > 500) {
        for (const [key, val] of tracker.entries()) {
          if (now - val.startTime > windowMs) {
            tracker.delete(key);
          }
        }
      }

      const current = tracker.get(ip);
      if (!current || now - current.startTime > windowMs) {
        tracker.set(ip, { count: 1, startTime: now });
        return next();
      }

      if (current.count >= maxRequests) {
        return res.status(429).json({
          success: false,
          message
        });
      }

      current.count += 1;
      next();
    } catch {
      next();
    }
  };
};

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many login attempts. Please wait 15 minutes before trying again.'
});

const adminLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many admin authentication attempts. Access temporarily paused. Please retry in 15 minutes.'
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 6,
  message: 'Too many account registrations from this network. Please try again later.'
});

const passwordResetLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many password reset requests. Please wait 15 minutes before trying again.'
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/admin-login', adminLoginLimiter, adminLogin);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
