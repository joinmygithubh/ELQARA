import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  slug: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  sku: { type: String }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    shippingAddress: {
      street: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    coupon: {
      code: { type: String, default: '' },
      discount: { type: Number, default: 0 }
    },
    totalAmount: {
      type: Number,
      required: true
    },
    baseCurrency: {
      type: String,
      default: 'INR'
    },
    displayCurrency: {
      type: String,
      default: 'INR'
    },
    exchangeRate: {
      type: Number,
      default: 1
    },
    displayAmount: {
      type: Number,
      default: function () {
        return this.totalAmount;
      }
    },
    paymentCurrency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE', 'UPI_NETBANKING'],
      default: 'COD'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    paymentDetails: {
      transactionId: { type: String, default: '' },
      paidAt: { type: Date }
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded'],
      default: 'Pending'
    },
    statusTimeline: [
      {
        status: { type: String, required: true },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    autoIndex: false
  }
);

orderSchema.index({ user: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.models?.Order || mongoose.model('Order', orderSchema);
export default Order;
