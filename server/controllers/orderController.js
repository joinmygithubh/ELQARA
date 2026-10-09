import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { getLiveRates } from '../services/currencyService.js';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public (Guest or logged in user)
export const createOrder = async (req, res, next) => {
  try {
    const {
      customer,
      shippingAddress,
      items,
      paymentMethod = 'COD',
      couponCode,
      notes,
      displayCurrency,
      currency,
      exchangeRate
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full customer contact details (name, email, phone)'
      });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete shipping address with pincode'
      });
    }

    // Verify stock and compute subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name || item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        quantity: item.quantity,
        image: product.thumbnail || (product.images && product.images[0]) || '',
        sku: product.sku
      });

      // Decrement stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Shipping policy: Complimentary shipping on orders above ₹1,999, else ₹199
    const shippingFee = subtotal >= 1999 ? 0 : 199;

    // Process coupon if provided
    let discountAmount = 0;
    let couponInfo = { code: '', discount: 0 };

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
      if (coupon) {
        const validity = coupon.isValid(subtotal);
        if (validity.valid) {
          discountAmount = coupon.calculateDiscount(subtotal);
          couponInfo = { code: coupon.code, discount: discountAmount };
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

    // Currency verification: Base currency is strictly INR
    const selectedCurrency = (displayCurrency || currency || 'INR').toUpperCase();
    let verifiedRate = 1;
    let verifiedDisplayAmount = totalAmount;

    if (selectedCurrency !== 'INR') {
      try {
        const liveRatesData = await getLiveRates();
        const rateFromService = liveRatesData?.rates?.[selectedCurrency];
        if (rateFromService && typeof rateFromService === 'number') {
          verifiedRate = rateFromService;
          verifiedDisplayAmount = Math.round(totalAmount * verifiedRate * 100) / 100;
        } else if (exchangeRate && typeof exchangeRate === 'number' && exchangeRate > 0) {
          verifiedRate = exchangeRate;
          verifiedDisplayAmount = Math.round(totalAmount * verifiedRate * 100) / 100;
        }
      } catch (err) {
        console.warn('Could not verify exchange rate for order:', err.message);
        if (exchangeRate && typeof exchangeRate === 'number' && exchangeRate > 0) {
          verifiedRate = exchangeRate;
          verifiedDisplayAmount = Math.round(totalAmount * verifiedRate * 100) / 100;
        }
      }
    }

    // Generate readable Order Number: ELQ-YYYY-RANDOM
    const orderNumber = `ELQ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user._id : null,
      customer,
      shippingAddress,
      items: orderItems,
      subtotal,
      shippingFee,
      discountAmount,
      coupon: couponInfo,
      totalAmount,
      baseCurrency: 'INR',
      displayCurrency: selectedCurrency,
      exchangeRate: verifiedRate,
      displayAmount: verifiedDisplayAmount,
      paymentCurrency: 'INR',
      paymentMethod,
      paymentStatus: paymentMethod === 'ONLINE' ? 'Paid' : 'Pending',
      orderStatus: 'Confirmed',
      statusTimeline: [
        {
          status: 'Confirmed',
          note: 'Order successfully placed and verified',
          timestamp: new Date()
        }
      ],
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by ID or Order Number
// @route   GET /api/orders/:id
// @access  Protected for registered orders / Public for matching guest order confirmation
export const getOrderById = async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { orderNumber: req.params.id };

    const order = await Order.findOne(query).populate('items.product', 'name slug images thumbnail');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Security & Data Isolation Check (Customers cannot access other customers' orders)
    if (order.user) {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to access this order'
        });
      }
      const isOwner = req.user._id.toString() === order.user.toString();
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view this order'
        });
      }
    } else {
      // Guest order verification: if requester is logged in as another user, prevent access
      if (req.user && req.user.role !== 'admin') {
        const matchesEmail = req.user.email?.toLowerCase() === order.customer?.email?.toLowerCase();
        if (!matchesEmail) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You are not authorized to view this order'
          });
        }
      }
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for admin with filters and search
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrdersForAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.email': searchRegex },
        { 'customer.phone': searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, note, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      order.statusTimeline.push({
        status: orderStatus,
        note: note || `Order status updated to ${orderStatus}`,
        timestamp: new Date()
      });

      // If status is Delivered, update paymentStatus to Paid if it was COD
      if (orderStatus === 'Delivered' && order.paymentMethod === 'COD') {
        order.paymentStatus = 'Paid';
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${orderStatus || order.orderStatus}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard order and sales statistics
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
export const getOrderStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const confirmedOrders = await Order.countDocuments({ orderStatus: 'Confirmed' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'Shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

    // Calculate total revenue from delivered and confirmed/processing orders
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $nin: ['Cancelled', 'Returned'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Recent 5 orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    // Low stock products count
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select('name sku stock thumbnail price')
      .limit(6);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        activeOrders: pendingOrders + confirmedOrders + processingOrders + shippedOrders,
        lowStockCount: lowStockProducts.length
      },
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    next(error);
  }
};
