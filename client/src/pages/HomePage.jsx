import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Flame, Compass, Star, ArrowUpRight } from 'lucide-react';
import Hero from '../components/Hero';
import FeaturesBar from '../components/FeaturesBar';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { productAPI, categoryAPI, homepageAPI } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const HomePage = () => {
  const { formatPrice } = useCurrency();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [homepageSettings, setHomepageSettings] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Room glow simulator state for interactive experience
  const [glowIntensity, setGlowIntensity] = useState(80);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featRes, newRes, bestRes, catRes, homeRes] = await Promise.all([
          productAPI.getAll({ featured: 'true', limit: 4 }),
          productAPI.getAll({ newArrival: 'true', limit: 4 }),
          productAPI.getAll({ bestSeller: 'true', limit: 4 }),
          categoryAPI.getAll(),
          homepageAPI.get()
        ]);

        if (featRes.data?.success) setFeaturedProducts(featRes.data.products);
        if (newRes.data?.success) setNewArrivals(newRes.data.products);
        if (bestRes.data?.success) setBestSellers(bestRes.data.products);
        if (catRes.data?.success) setCategories(catRes.data.categories);
        if (homeRes.data?.success) setHomepageSettings(homeRes.data.settings);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="home-page-container">
      {/* 1. HERO SECTION (Exact Reference UI Reproduction) */}
      <Hero customSlides={homepageSettings?.heroSlides} />

      {/* 2. VALUE PROPOSITION / TRUST BAR (Exact Reference UI Reproduction) */}
      <FeaturesBar />

      {/* 3. CURATED CATEGORIES SECTION */}
      <section className="section-spacing" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header-wrap">
            <span className="pre-heading">ARCHITECTURAL DISCIPLINES</span>
            <h2 className="section-title">Curated Lighting & Objects</h2>
            <p className="section-desc">
              Explore our disciplined collection of tabletop illuminators, sculptural floor fixtures, and heritage woodwork.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 5',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  backgroundColor: '#EAE5DC',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '2rem',
                  color: 'var(--text-white)'
                }}
                className="category-card-hover"
              >
                <img
                  src={cat.image || '/uploads/prod-mushroom-wood.jpg'}
                  alt={cat.name}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 700ms ease'
                  }}
                  className="cat-img"
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(0deg, rgba(20,18,16,0.85) 0%, rgba(20,18,16,0.2) 60%, rgba(20,18,16,0) 100%)'
                  }}
                />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-gold)' }}>
                    {cat.productCount ? `${cat.productCount} Designs` : 'View Edition'}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', color: '#FFFFFF', marginTop: '0.2rem', marginBottom: '0.6rem' }}>
                    {cat.name}
                  </h3>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase'
                    }}
                  >
                    <span>Explore</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (Directly pulled from MongoDB) */}
      <section className="section-spacing">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="pre-heading">HANDPICKED EDITIONS</span>
              <h2 className="section-title">Considered Centerpieces</h2>
            </div>
            <Link to="/shop?featured=true" className="btn-outline">
              <span>View All Featured</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. ARTISAN HERITAGE SPOTLIGHT — SAHARANPUR MASTERY */}
      <section
        style={{
          backgroundColor: 'var(--bg-dark)',
          color: 'var(--text-white)',
          padding: '6rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '4rem',
              alignItems: 'center'
            }}
          >
            <div>
              <span className="pre-heading white">THE ATELIER STORY</span>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.4rem, 4vw, 3.5rem)',
                  color: '#FFFFFF',
                  lineHeight: 1.12,
                  marginTop: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                Rooted in Saharanpur. Crafted for Modern Life.
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  color: 'rgba(250, 247, 242, 0.8)',
                  marginBottom: '1.5rem'
                }}
              >
                For over four centuries, the city of Saharanpur in northern India has been celebrated as the global cradle of artisanal woodcarving and fine turnery. Every ELQARA lamp is born here — in our woodturning atelier — where generational master woodturners shape sustainably sourced walnut, teak, and Sheesham timber by eye and touch.
              </p>
              <p
                style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.8,
                  color: 'rgba(250, 247, 242, 0.65)',
                  marginBottom: '2.5rem'
                }}
              >
                We unite this irreplaceable heritage craft with heavy aged brass, hand-blown borosilicate glass, and soothing 2700K ambient LED technology.
              </p>

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--accent-gold)' }}>100%</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(250,247,242,0.65)' }}>Natural Seasoned Timber</div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--accent-gold)' }}>400+</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(250,247,242,0.65)' }}>Years of Wood Craft Lineage</div>
                </div>
              </div>

              <Link to="/about" className="btn-primary">
                <span>Discover Our Heritage</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <img
                  src="/uploads/hero-slide-1.jpg"
                  alt="Saharanpur Wood Lamp Craftsmanship"
                  style={{ width: '100%', height: '520px', objectFit: 'cover' }}
                />
              </div>

              {/* Float quote card */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-24px',
                  left: '-24px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-main)',
                  padding: '1.5rem',
                  maxWidth: '320px',
                  boxShadow: 'var(--shadow-lg)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-hairline)'
                }}
              >
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.4, marginBottom: '0.6rem' }}>
                  "We don't merely turn timber into lamps; we sculpt light into a companion for the home."
                </p>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                  — Master Artisan, Saharanpur Atelier
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE ROOM GLOW SIMULATOR */}
      <section className="section-spacing" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="section-header-wrap">
            <span className="pre-heading">CONSIDERED ILLUMINATION</span>
            <h2 className="section-title">Experience the 2700K Evening Glow</h2>
            <p className="section-desc">
              All ELQARA lamps are calibrated to emit a comforting, amber ambient spectrum that helps transition your nervous system into restorative stillness.
            </p>
          </div>

          <div
            style={{
              maxWidth: '960px',
              margin: '0 auto',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div
              style={{
                position: 'relative',
                height: '420px',
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
                backgroundColor: '#1E1B18',
                marginBottom: '2rem'
              }}
            >
              <img
                src="/uploads/hero-slide-1.jpg"
                alt="Room ambience test"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: `brightness(${0.4 + (glowIntensity / 100) * 0.7}) saturate(${0.8 + (glowIntensity / 100) * 0.5})`
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at 45% 45%, rgba(255, 190, 110, ${glowIntensity / 250}) 0%, rgba(20, 15, 12, ${(100 - glowIntensity) / 120}) 100%)`,
                  pointerEvents: 'none'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: 'rgba(25, 22, 20, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  borderRadius: '2px',
                  letterSpacing: '0.08em'
                }}
              >
                AMBIENCE: {glowIntensity}% WARM GLOW (2700K)
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', minWidth: '140px' }}>
                Dimmer Control:
              </span>
              <input
                type="range"
                min="10"
                max="100"
                value={glowIntensity}
                onChange={(e) => setGlowIntensity(Number(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: 'var(--accent-gold)',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-serif)', fontWeight: 600, minWidth: '48px' }}>
                {glowIntensity}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NEW ARRIVALS & RECENT RELEASES */}
      <section className="section-spacing" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="pre-heading">FRESH FROM SAHARANPUR</span>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <Link to="/shop?newArrival=true" className="btn-outline">
              <span>View All New Releases</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="product-grid">
            {newArrivals.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 8. BEST SELLERS / ICONIC DESIGNS */}
      <section className="section-spacing">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="pre-heading">TIMELESS EDITIONS</span>
              <h2 className="section-title">Best Sellers</h2>
              <p className="section-desc">
                Our most coveted handcrafted luminaires, cherished across homes, studios, and architectural sanctuaries.
              </p>
            </div>
            <Link to="/shop?bestSeller=true" className="btn-outline">
              <span>View All Best Sellers</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="product-grid">
            {bestSellers.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 9. PROMOTIONAL ATELIER PRIVILEGE BANNER */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '5rem 0', borderTop: '1px solid var(--border-hairline)', borderBottom: '1px solid var(--border-hairline)' }}>
        <div className="container" style={{ maxWidth: '900px', textAlign: 'center' }}>
          <span className="pre-heading" style={{ justifyContent: 'center' }}>
            ATELIER INAUGURATION PRIVILEGE
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 3.8vw, 3rem)', color: 'var(--text-main)', marginTop: '0.4rem', marginBottom: '1rem' }}>
            Complimentary White-Glove Delivery & 10% First Acquisition Savings
          </h2>
          <p style={{ color: 'var(--text-body)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Use courtesy code <strong style={{ color: 'var(--accent-gold)', letterSpacing: '0.1em' }}>WELCOME10</strong> at checkout on orders above {formatPrice(1999)}. Includes tailored foam wooden crate packaging and complimentary bulb fixtures.
          </p>
          <Link to="/shop" className="btn-dark" style={{ padding: '0.85rem 2rem' }}>
            <span>Explore The Collection</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 10. CLIENT REVIEWS / COLLECTOR TESTIMONIALS */}
      <section className="section-spacing">
        <div className="container">
          <div className="section-header-wrap">
            <span className="pre-heading">WORDS OF APPRECIATION</span>
            <h2 className="section-title">In Living Spaces Worldwide</h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}
          >
            {[
              {
                quote:
                  'The Komorebi Mushroom Lamp is undeniably the centerpiece of our living room console. The wood grain is hypnotic, and the warm glow creates an immediate sense of sanctuary.',
                author: 'Rhea Sen',
                title: 'Interior Stylist, Mumbai',
                rating: 5
              },
              {
                quote:
                  'As an architect, I am exceedingly discerning about luminaire proportions. The Sylvan Arc floor lamp possesses exquisite balance—neither ostentatious nor understated. Pure sculptural poetry.',
                author: 'Karan Mehra',
                title: 'Principal Architect, New Delhi',
                rating: 5
              },
              {
                quote:
                  'Knowing this piece was carved by master artisans in Saharanpur gives it soul. The brass toggle switch feels wonderfully tactile. Customer delivery was flawless.',
                author: 'Ananya Pillai',
                title: 'Collector, Bengaluru',
                rating: 5
              }
            ].map((review, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-hairline)',
                  padding: '2.5rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', color: 'var(--accent-gold)', marginBottom: '1.25rem' }}>
                  {[...Array(review.rating)].map((_, idx) => (
                    <Star key={idx} size={15} fill="currentColor" strokeWidth={1} />
                  ))}
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.15rem',
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                    marginBottom: '1.75rem',
                    fontStyle: 'italic'
                  }}
                >
                  "{review.quote}"
                </p>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {review.author}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {review.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <style>{`
        .category-card-hover:hover .cat-img {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
};

export default HomePage;
