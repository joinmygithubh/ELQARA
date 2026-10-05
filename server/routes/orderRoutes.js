import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrdersForAdmin,
  updateOrderStatus,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Order creation (Public for guests & registered users)
// Optional auth helper: if token is present, req.user will be populated
router.post('/', async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => createOrder(req, res, next));
  }
  return createOrder(req, res, next);
});

// Customer routes
router.get('/my-orders', protect, getMyOrders);

// Admin routes
router.get('/', protect, adminOnly, getAllOrdersForAdmin);
router.get('/admin/stats', protect, adminOnly, getOrderStats);
router.get('/admin/all', protect, adminOnly, getAllOrdersForAdmin);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

// Order lookup by ID / Number
router.get('/:id', getOrderById);

export default router;
