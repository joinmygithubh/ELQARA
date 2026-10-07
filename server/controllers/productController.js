import Product from '../models/Product.js';
import Category from '../models/Category.js';
import slugify from 'slugify';

// @desc    Get all products with search, filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      material,
      bulbType,
      featured,
      bestSeller,
      newArrival,
      sort,
      page = 1,
      limit = 12,
      adminView
    } = req.query;

    const query = {};

    // Filter by status (unless admin view is specifically requested by authorized admin)
    if (!adminView) {
      query.status = 'active';
    }

    // Category filter (support category slug or ObjectId)
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCategory = await Category.findOne({ slug: category });
        if (foundCategory) {
          query.category = foundCategory._id;
        }
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Stock availability filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Material filter
    if (material) {
      query['specifications.material'] = { $regex: material, $options: 'i' };
    }

    // Bulb compatibility filter
    if (bulbType) {
      query['specifications.bulbType'] = { $regex: bulbType, $options: 'i' };
    }

    // Featured / Best Seller / New Arrival flags
    if (featured === 'true') query.featured = true;
    if (bestSeller === 'true') query.bestSeller = true;
    if (newArrival === 'true') query.newArrival = true;

    // Search query (search name, shortDescription, description, tags, SKU, categoryName)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { shortDescription: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { sku: searchRegex },
        { categoryName: searchRegex }
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price-low') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-high') {
      sortOptions = { price: -1 };
    } else if (sort === 'name-asc') {
      sortOptions = { name: 1 };
    } else if (sort === 'rating') {
      sortOptions = { 'ratings.average': -1 };
    } else if (sort === 'featured') {
      sortOptions = { featured: -1, createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (error) {
    console.error('[getProducts Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products',
      products: [],
      total: 0
    });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Fetch related products in same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active'
    })
      .limit(4)
      .select('name slug price mrp discount thumbnail category images ratings stock');

    res.json({
      success: true,
      product,
      relatedProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID or Slug (Admin or public lookup)
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    let product = null;

    if (isObjectId) {
      product = await Product.findById(req.params.id).populate('category', 'name slug');
    }

    if (!product) {
      product = await Product.findOne({ slug: req.params.id }).populate('category', 'name slug');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product (Admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    // Fetch category name for fast snapshots
    if (productData.category) {
      const cat = await Category.findById(productData.category);
      if (cat) {
        productData.categoryName = cat.name;
      }
    }

    // Auto-generate SKU if omitted
    if (!productData.sku) {
      const prefix = productData.name.substring(0, 3).toUpperCase();
      productData.sku = `ELQ-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Ensure slug
    if (!productData.slug && productData.name) {
      productData.slug = slugify(productData.name, { lower: true, strict: true }) + '-' + Math.floor(100 + Math.random() * 900);
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully and published to store',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    if (productData.category) {
      const cat = await Category.findById(productData.category);
      if (cat) {
        productData.categoryName = cat.name;
      }
    }

    if (productData.name && !productData.slug) {
      productData.slug = slugify(productData.name, { lower: true, strict: true });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, productData, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product status (active/inactive)
// @route   PATCH /api/products/:id/status
// @access  Private/Admin
export const toggleProductStatus = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.status = product.status === 'active' ? 'inactive' : 'active';
    await product.save();

    res.json({
      success: true,
      message: `Product marked as ${product.status}`,
      status: product.status
    });
  } catch (error) {
    next(error);
  }
};
