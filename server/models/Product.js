import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    shortDescription: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    categoryName: {
      type: String,
      default: ''
    },
    subcategory: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Price must be positive']
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      min: [0, 'MRP must be positive']
    },
    discount: {
      type: Number,
      default: 0
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 10
    },
    images: {
      type: [String],
      default: []
    },
    thumbnail: {
      type: String,
      default: ''
    },
    specifications: {
      material: { type: String, default: 'Solid Walnut Wood & Brass' },
      color: { type: String, default: 'Natural Warm Walnut' },
      dimensions: { type: String, default: '32 cm x 32 cm x 46 cm' },
      weight: { type: String, default: '2.8 kg' },
      bulbType: { type: String, default: 'E27 Warm LED Filament (Included)' },
      wattage: { type: String, default: '8W Warm White (2700K)' },
      voltage: { type: String, default: '220V - 240V AC' },
      warranty: { type: String, default: '2 Years Manufacturer Warranty' }
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    featured: {
      type: Boolean,
      default: false
    },
    bestSeller: {
      type: Boolean,
      default: false
    },
    newArrival: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active'
    },
    ratings: {
      average: { type: Number, default: 4.9 },
      count: { type: Number, default: 12 }
    }
  },
  {
    timestamps: true,
    autoIndex: false
  }
);

productSchema.pre('validate', function (next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    // Append short suffix if not set or create unique
    if (!this.slug) {
      this.slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }
  if (this.mrp && this.price) {
    if (this.mrp > this.price) {
      this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
    } else {
      this.discount = 0;
    }
  }
  if (!this.thumbnail && this.images && this.images.length > 0) {
    this.thumbnail = this.images[0];
  }
  next();
});

productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
