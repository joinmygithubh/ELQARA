import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: 0
    },
    minOrderValue: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number,
      default: null // null means unlimited for percentage
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    usageLimit: {
      type: Number,
      default: 100
    },
    usedCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    autoIndex: false
  }
);

couponSchema.methods.isValid = function (orderTotal) {
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (new Date() > this.expiryDate) return { valid: false, message: 'Coupon has expired' };
  if (this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderTotal < this.minOrderValue) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${this.minOrderValue} required for this coupon`
    };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (orderTotal) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (orderTotal * this.discountValue) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
  }
  return Math.min(Math.round(discount), orderTotal);
};

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
export default Coupon;
