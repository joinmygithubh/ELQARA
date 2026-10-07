import mongoose from 'mongoose';
import Enquiry from '../models/Enquiry.js';
import Product from '../models/Product.js';
import { sendEnquiryNotification } from '../services/emailService.js';

// Basic email regex for backend validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @desc    Submit a new customer enquiry and dispatch email notification
 * @route   POST /api/enquiries
 * @access  Public (Rate-limited)
 */
export const createEnquiry = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      productId,
      productName,
      productSku,
      productUrl,
      quantity,
      preferredContact
    } = req.body;

    // 1. Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid customer name (at least 2 characters).'
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an enquiry message with at least 5 characters.'
      });
    }

    if (message.trim().length > 4000) {
      return res.status(400).json({
        success: false,
        message: 'Enquiry message cannot exceed 4000 characters.'
      });
    }

    // 2. Resolve Product if productId is provided
    let verifiedProduct = null;
    let finalProductName = (productName || '').trim();
    let finalProductSku = (productSku || '').trim();

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      try {
        verifiedProduct = await Product.findById(productId).select('name sku');
        if (verifiedProduct) {
          finalProductName = verifiedProduct.name;
          finalProductSku = verifiedProduct.sku || finalProductSku;
        }
      } catch (err) {
        console.warn('[EnquiryController] Product lookup notice:', err.message);
      }
    }

    // 3. Extract client IP safely (supports Cloudflare header)
    const clientIp =
      req.headers['cf-connecting-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      '';

    // 4. Save enquiry into MongoDB Atlas
    const enquiryData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      subject: (subject || (finalProductName ? `Inquiry: ${finalProductName}` : 'Bespoke Atelier Inquiry')).trim(),
      message: message.trim(),
      product: verifiedProduct ? verifiedProduct._id : (productId && mongoose.Types.ObjectId.isValid(productId) ? productId : null),
      productName: finalProductName,
      productSku: finalProductSku,
      productUrl: (productUrl || '').trim(),
      quantity: Number(quantity) > 0 ? Number(quantity) : 1,
      preferredContact: ['Email', 'Phone', 'WhatsApp', 'Any'].includes(preferredContact)
        ? preferredContact
        : 'Email',
      status: 'New',
      ipAddress: clientIp
    };

    const enquiry = await Enquiry.create(enquiryData);

    // 5. Dispatch email notification to elqara.home@gmail.com
    try {
      await sendEnquiryNotification(enquiry);
      enquiry.emailSent = true;
      enquiry.emailDeliveryError = '';
      await enquiry.save();

      return res.status(201).json({
        success: true,
        message: 'Your enquiry has been sent successfully. Our team will contact you shortly.',
        data: {
          id: enquiry._id,
          name: enquiry.name,
          email: enquiry.email,
          productName: enquiry.productName,
          status: enquiry.status,
          createdAt: enquiry.createdAt
        }
      });
    } catch (emailError) {
      console.error('[EnquiryController] Notification delivery error:', emailError.message);
      enquiry.emailSent = false;
      enquiry.emailDeliveryError = emailError.message;
      await enquiry.save();

      // In accordance with Requirement 13:
      // "If email sending fails: Do NOT show a false success message.
      // Show: 'We couldn't send your enquiry right now. Please try again.'"
      return res.status(502).json({
        success: false,
        message: "We couldn't send your enquiry right now. Please try again."
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all enquiries with filters, pagination, and counts (Admin)
 * @route   GET /api/enquiries/admin/all
 * @access  Private/Admin
 */
export const getAllEnquiries = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by status (New, Contacted, Resolved)
    if (req.query.status && ['New', 'Contacted', 'Resolved'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    // Filter by search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { productName: searchRegex },
        { subject: searchRegex },
        { message: searchRegex }
      ];
    }

    const [enquiries, total, newCount, contactedCount, resolvedCount] = await Promise.all([
      Enquiry.find(filter)
        .populate('product', 'name slug price thumbnail images stock')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enquiry.countDocuments(filter),
      Enquiry.countDocuments({ status: 'New' }),
      Enquiry.countDocuments({ status: 'Contacted' }),
      Enquiry.countDocuments({ status: 'Resolved' })
    ]);

    res.json({
      success: true,
      count: enquiries.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      stats: {
        totalAll: newCount + contactedCount + resolvedCount,
        new: newCount,
        contacted: contactedCount,
        resolved: resolvedCount
      },
      enquiries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single enquiry by ID (Admin)
 * @route   GET /api/enquiries/:id
 * @access  Private/Admin
 */
export const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id)
      .populate('product', 'name slug price thumbnail images stock sku')
      .lean();

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry record not found'
      });
    }

    res.json({
      success: true,
      enquiry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update enquiry status and internal notes (Admin)
 * @route   PATCH /api/enquiries/:id/status
 * @access  Private/Admin
 */
export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const updateFields = {};
    if (status && ['New', 'Contacted', 'Resolved'].includes(status)) {
      updateFields.status = status;
    }
    if (typeof adminNotes === 'string') {
      updateFields.adminNotes = adminNotes;
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry record not found'
      });
    }

    res.json({
      success: true,
      message: `Enquiry updated to "${enquiry.status}"`,
      enquiry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an enquiry (Admin)
 * @route   DELETE /api/enquiries/:id
 * @access  Private/Admin
 */
export const deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry record not found'
      });
    }

    res.json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
