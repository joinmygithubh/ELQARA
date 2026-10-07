import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Star,
  ChevronRight,
  CheckCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from '../components/ProductCard';
import EnquiryModal from '../components/EnquiryModal';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice, currency } = useCurrency();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specifications'); // 'specifications' | 'craft' | 'shipping'
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getBySlug(slug);
        if (res.data?.success) {
          setProduct(res.data.product);
          setRelatedProducts(res.data.relatedProducts || []);
          setActiveImage(0);
          setQuantity(1);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading handcrafted edition...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>
          Edition Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          The requested handcrafted object is no longer available or the link has expired.
        </p>
        <Link to="/shop" className="btn-dark">
          Return to Shop Catalog
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail || '/logo-icon.svg'];
  const isFavorited = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: '6rem' }}>
      {/* Breadcrumb Navigation */}
      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
          aria-label="Breadcrumb"
        >
          <Link to="/" style={{ color: 'inherit' }}>Home</Link>
          <ChevronRight size={13} />
          <Link to="/shop" style={{ color: 'inherit' }}>Shop</Link>
          <ChevronRight size={13} />
          {product.category && (
            <>
              <Link to={`/shop?category=${product.category.slug}`} style={{ color: 'inherit' }}>
                {product.category.name}
              </Link>
              <ChevronRight size={13} />
            </>
          )}
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{product.name}</span>
        </nav>
      </div>

      {/* Main Product Showcase Section */}
      <section className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '4rem',
            alignItems: 'start'
          }}
        >
          {/* Left Column: Image Gallery */}
          <div>
            {/* Primary Large Image */}
            <div
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                marginBottom: '1rem'
              }}
            >
              <img
                src={images[activeImage] || images[0]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />

              {product.discount > 0 && (
                <div style={{ position: 'absolute', top: 16, left: 16 }}>
                  <span className="badge-tag discount">Save {product.discount}%</span>
                </div>
              )}
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    style={{
                      width: '76px',
                      height: '76px',
                      flexShrink: 0,
                      borderRadius: 'var(--radius-xs)',
                      overflow: 'hidden',
                      backgroundColor: '#FFFFFF',
                      border: `2px solid ${activeImage === idx ? 'var(--text-main)' : 'var(--border-hairline)'}`,
                      cursor: 'pointer'
                    }}
                    aria-label={`Show image ${idx + 1}`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="pre-heading" style={{ marginBottom: '0.6rem' }}>
              {product.category?.name || product.categoryName || 'LIGHTING DESIGN'}
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                lineHeight: 1.15,
                marginBottom: '0.8rem',
                color: 'var(--text-main)'
              }}
            >
              {product.name}
            </h1>

            {/* Ratings & SKU */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ display: 'flex', color: 'var(--accent-gold)' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.floor(product.ratings?.average || 5) ? 'currentColor' : 'none'}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', marginLeft: '4px' }}>
                  {product.ratings?.average || 4.9}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  ({product.ratings?.count || 12} Collector Reviews)
                </span>
              </div>

              <span style={{ color: 'var(--border-medium)' }}>|</span>
              <span style={{ color: 'var(--text-muted)' }}>SKU: <strong>{product.sku}</strong></span>
            </div>

            {/* Pricing Section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '1rem',
                padding: '1.25rem 0',
                borderTop: '1px solid var(--border-hairline)',
                borderBottom: '1px solid var(--border-hairline)',
                marginBottom: '1.5rem'
              }}
            >
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {formatPrice(product.price)}
              </span>
              {product.mrp > product.price && (
                <span style={{ fontSize: '1.2rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                  {formatPrice(product.mrp)}
                </span>
              )}
              {product.discount > 0 && (
                <span
                  style={{
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '2px'
                  }}
                >
                  {product.discount}% SAVINGS
                </span>
              )}
            </div>

            {/* Short Narrative */}
            <p style={{ fontSize: '0.98rem', lineHeight: 1.7, color: 'var(--text-body)', marginBottom: '1.75rem' }}>
              {product.description}
            </p>

            {/* Stock Availability */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', fontSize: '0.85rem' }}>
              <div
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: product.stock > 0 ? '#16A34A' : '#DC2626'
                }}
              />
              {product.stock > 0 ? (
                <span style={{ color: '#16A34A', fontWeight: 600 }}>
                  Ready to Dispatch ({product.stock} units available at Saharanpur Atelier)
                </span>
              ) : (
                <span style={{ color: '#DC2626', fontWeight: 600 }}>
                  Currently Made-to-Order (Lead time 2-3 weeks)
                </span>
              )}
            </div>

            {/* Purchase Actions (Quantity, Add to Bag, Buy Now, Wishlist) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* Quantity Stepper */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '0.8rem 1rem', fontSize: '1.1rem' }}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span style={{ padding: '0 0.8rem', fontWeight: 600, minWidth: '32px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                    style={{ padding: '0.8rem 1rem', fontSize: '1.1rem' }}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  type="button"
                  className="btn-dark"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  style={{ flex: 1, padding: '0.95rem 1.5rem' }}
                >
                  <ShoppingBag size={18} />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  className={`btn-outline ${isFavorited ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                  style={{ width: '54px', padding: 0 }}
                  aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    size={20}
                    fill={isFavorited ? 'currentColor' : 'none'}
                    color={isFavorited ? 'var(--accent-terracotta)' : 'inherit'}
                  />
                </button>
              </div>

              {/* Buy Now Direct Button */}
              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    backgroundColor: 'var(--accent-gold)',
                    color: '#FFFFFF',
                    padding: '0.95rem',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-warm)'
                  }}
                >
                  <Zap size={18} />
                  <span>Instant Checkout — Buy Now</span>
                </button>
              )}

              {/* Bespoke / Product Enquiry Button */}
              <button
                type="button"
                onClick={() => setIsEnquiryOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main, #1C1917)',
                  padding: '0.85rem',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: '1px solid var(--border-medium, #D5CEBE)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-gold)';
                  e.currentTarget.style.color = 'var(--accent-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-medium, #D5CEBE)';
                  e.currentTarget.style.color = 'var(--text-main, #1C1917)';
                }}
              >
                <MessageSquare size={16} />
                <span>Enquire About This Piece / Custom Dimensions</span>
              </button>
            </div>

            {/* Atelier Assurance Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Truck size={17} color="var(--accent-gold)" />
                <span>Complimentary Delivery in India</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={17} color="var(--accent-gold)" />
                <span>2-Year Manufacturer Warranty</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={17} color="var(--accent-gold)" />
                <span>Handcrafted Saharanpur Timber</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <RotateCcw size={17} color="var(--accent-gold)" />
                <span>7-Day Hassle-Free Exchange</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Specifications & Craft Story */}
        <div style={{ marginTop: '5rem', borderTop: '1px solid var(--border-hairline)', paddingTop: '3rem' }}>
          <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-hairline)', marginBottom: '2.5rem' }}>
            {['specifications', 'craft', 'shipping'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  paddingBottom: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: activeTab === tab ? 'var(--text-main)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${activeTab === tab ? 'var(--text-main)' : 'transparent'}`,
                  cursor: 'pointer'
                }}
              >
                {tab === 'specifications' && 'Architectural Specifications'}
                {tab === 'craft' && 'Saharanpur Artisanship'}
                {tab === 'shipping' && 'White-Glove Shipping & Care'}
              </button>
            ))}
          </div>

          {activeTab === 'specifications' && (
            <div style={{ maxWidth: '780px' }}>
              <div className="custom-table-wrap">
                <table className="custom-table">
                  <tbody>
                    <tr>
                      <th style={{ width: '35%' }}>Primary Material</th>
                      <td>{product.specifications?.material || 'Solid Hardwood & Brass'}</td>
                    </tr>
                    <tr>
                      <th>Dimensions</th>
                      <td>{product.specifications?.dimensions || 'See details'}</td>
                    </tr>
                    <tr>
                      <th>Weight</th>
                      <td>{product.specifications?.weight || 'Standard'}</td>
                    </tr>
                    <tr>
                      <th>Color & Finish</th>
                      <td>{product.specifications?.color || 'Natural Walnut & Antique Brass'}</td>
                    </tr>
                    <tr>
                      <th>Bulb Compatibility</th>
                      <td>{product.specifications?.bulbType || 'E27 Warm LED Filament (Included)'}</td>
                    </tr>
                    <tr>
                      <th>Wattage & Temperature</th>
                      <td>{product.specifications?.wattage || '8W (2700K Warm White)'}</td>
                    </tr>
                    <tr>
                      <th>Operating Voltage</th>
                      <td>{product.specifications?.voltage || '220V - 240V AC, 50Hz'}</td>
                    </tr>
                    <tr>
                      <th>Warranty Protection</th>
                      <td>{product.specifications?.warranty || '2 Years Comprehensive ELQARA Warranty'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'craft' && (
            <div style={{ maxWidth: '780px', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--text-body)' }}>
              <p style={{ marginBottom: '1rem' }}>
                Every ELQARA piece represents days of meticulous craft in Saharanpur, Uttar Pradesh. Our timbers are kiln-seasoned for over 90 days to achieve optimum moisture equilibrium, ensuring that the wood will never crack or warp under changing household climates.
              </p>
              <p>
                The gentle finish is hand-rubbed using natural bees-wax and cold-pressed linseed oils, preserving the living texture and tactile grain of the organic timber without artificial polyurethane coats.
              </p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div style={{ maxWidth: '780px', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--text-body)' }}>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Reinforced Wooden Crate Packaging:</strong> To safeguard fragile blown glass and fine wooden shades, all ELQARA luminaires are encased in custom foam cradles inside reinforced outer crates.
              </p>
              <p>
                Dispatched directly from our Saharanpur atelier with full transit insurance. Express deliveries reach Delhi NCR within 48 hours, and Mumbai, Bengaluru, and other metro locations within 3-5 business days.
              </p>
            </div>
          )}
        </div>

        {/* Related Products Carousel / Grid */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '6rem' }}>
            <div className="section-header-wrap left-aligned" style={{ marginBottom: '2.5rem' }}>
              <span className="pre-heading">COMPLEMENTARY PIECES</span>
              <h2 className="section-title">Complete the Space</h2>
            </div>
            <div className="product-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Product Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetailPage;
