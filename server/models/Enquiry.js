import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [30, 'Phone number cannot exceed 30 characters']
    },
    subject: {
      type: String,
      trim: true,
      default: 'Product Inquiry',
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Enquiry message is required'],
      trim: true,
      minlength: [5, 'Message must be at least 5 characters'],
      maxlength: [4000, 'Message cannot exceed 4000 characters']
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    productName: {
      type: String,
      trim: true,
      default: ''
    },
    productSku: {
      type: String,
      trim: true,
      default: ''
    },
    productUrl: {
      type: String,
      trim: true,
      default: ''
    },
    quantity: {
      type: Number,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    preferredContact: {
      type: String,
      enum: ['Email', 'Phone', 'WhatsApp', 'Any'],
      default: 'Email'
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Resolved'],
      default: 'New'
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    emailDeliveryError: {
      type: String,
      default: ''
    },
    adminNotes: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast admin queries
enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ productName: 'text', name: 'text', email: 'text', message: 'text' });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;
