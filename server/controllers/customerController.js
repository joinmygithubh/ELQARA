import User from '../models/User.js';
import Order from '../models/Order.js';

// @desc    Get all customers with order statistics (Admin)
// @route   GET /api/customers
// @access  Private/Admin
export const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: 'customer' };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Aggregate spend and order count for each customer
    const customersWithStats = await Promise.all(
      users.map(async (u) => {
        const orders = await Order.find({
          $or: [{ user: u._id }, { 'customer.email': u.email }]
        });

        const orderCount = orders.length;
        const totalSpent = orders.reduce((sum, ord) => {
          if (ord.orderStatus !== 'Cancelled' && ord.orderStatus !== 'Returned') {
            return sum + ord.totalAmount;
          }
          return sum;
        }, 0);

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          addresses: u.addresses,
          isBlocked: u.isBlocked,
          createdAt: u.createdAt,
          orderCount,
          totalSpent
        };
      })
    );

    res.json({
      success: true,
      count: customersWithStats.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      customers: customersWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle customer block status (Admin)
// @route   PATCH /api/customers/:id/toggle-block
// @access  Private/Admin
export const toggleBlockCustomer = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block administrator accounts'
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `Customer account ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      isBlocked: user.isBlocked
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer by ID with full order history (Admin)
// @route   GET /api/customers/:id
// @access  Private/Admin
export const getCustomerById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const orders = await Order.find({
      $or: [{ user: user._id }, { 'customer.email': user.email }]
    }).sort({ createdAt: -1 });

    const totalSpent = orders.reduce((sum, ord) => {
      if (ord.orderStatus !== 'Cancelled' && ord.orderStatus !== 'Returned') {
        return sum + ord.totalAmount;
      }
      return sum;
    }, 0);

    res.json({
      success: true,
      customer: {
        ...user.toObject(),
        orderCount: orders.length,
        totalSpent,
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

