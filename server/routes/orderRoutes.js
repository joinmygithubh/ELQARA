import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrdersForAdmin,
  updateOrderStatus,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Order creation (Guests & registered users)
router.post('/', optionalAuth, createOrder);

// Customer routes
router.get('/my-orders', protect, getMyOrders);

// Admin routes
router.get('/', protect, adminOnly, getAllOrdersForAdmin);
router.get('/admin/stats', protect, adminOnly, getOrderStats);
router.get('/admin/all', protect, adminOnly, getAllOrdersForAdmin);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

// Order lookup by ID / Number (Protected with owner validation & optional auth)
router.get('/:id', optionalAuth, getOrderById);

export default router;
