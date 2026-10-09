import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, RefreshCw, X, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { productAPI, categoryAPI } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);

  // Filters state
  const selectedCategory = searchParams.get('category') || 'all';
  const sortParam = searchParams.get('sort') || 'newest';
  const searchParam = searchParams.get('search') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const materialParam = searchParams.get('material') || '';

  // Local state for price range slider
  const [priceRange, setPriceRange] = useState(maxPriceParam || 20000);

  // Fetch categories once
  useEffect(() => {
    categoryAPI.getAll().then((res) => {
      if (res.data?.success) setCategories(res.data.categories);
    });
  }, []);

  // Fetch products when query params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: pageParam,
          limit: 12,
          sort: sortParam
        };

        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (searchParam) {
          params.search = searchParam;
        }
        if (inStockParam) {
          params.inStock = 'true';
        }
        if (maxPriceParam) {
          params.maxPrice = maxPriceParam;
        }
        if (materialParam) {
          params.material = materialParam;
        }

        const res = await productAPI.getAll(params);
        if (res.data?.success) {
          setProducts(res.data.products);
          setTotalCount(res.data.total);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (!val || val === 'all' || val === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, val);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePriceApply = () => {
    updateFilter('maxPrice', priceRange < 20000 ? priceRange : null);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setPriceRange(20000);
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (inStockParam ? 1 : 0) +
    (maxPriceParam ? 1 : 0) +
    (materialParam ? 1 : 0) +
    (searchParam ? 1 : 0);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* Page Header */}
      <section
        style={{
          paddingTop: '3.5rem',
          paddingBottom: '3.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-hairline)'
        }}
      >
        <div className="container">
          <span className="pre-heading">ARTISANAL COLLECTION</span>
          <h1 className="section-title">Considered Luminaires & Objects</h1>
          <p className="section-desc">
            Explore handcrafted table lamps, arched floor fixtures, paper pendants, and seasoned Sheesham decorative objects made for thoughtful living spaces.
          </p>
        </div>
      </section>

      {/* Main Catalog Layout */}
      <div className="container" style={{ paddingTop: '2.5rem' }}>
        {/* Top Control Bar: Active filters & sorting */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-hairline)',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="btn-outline mobile-filter-btn"
              onClick={() => setIsFilterMobileOpen(!isFilterMobileOpen)}
              style={{ display: 'none', padding: '0.6rem 1rem' }}
            >
              <SlidersHorizontal size={15} />
              <span>Filters ({activeFilterCount})</span>
            </button>

            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing <strong>{products.length}</strong> of <strong>{totalCount}</strong> editions
            </span>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--accent-terracotta)',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sort by:</span>
            <select
              value={sortParam}
              onChange={(e) => updateFilter('sort', e.target.value)}
              style={{
                padding: '0.55rem 1rem',
                border: '1px solid var(--border-medium)',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Newest Editions</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>

        {/* 2-Column Grid: Filters Sidebar + Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '3rem' }} className="shop-layout-grid">
          {/* Sidebar Filters */}
          <aside className={`shop-sidebar ${isFilterMobileOpen ? 'mobile-open' : ''}`}>
            {/* Category Filter */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
                Categories
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
                <li>
                  <button
                    type="button"
                    onClick={() => updateFilter('category', 'all')}
                    style={{
                      textAlign: 'left',
                      width: '100%',
                      padding: '0.3rem 0',
                      color: selectedCategory === 'all' ? 'var(--text-main)' : 'var(--text-muted)',
                      fontWeight: selectedCategory === 'all' ? 600 : 400
                    }}
                  >
                    All Disciplines ({totalCount})
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <button
                      type="button"
                      onClick={() => updateFilter('category', cat.slug)}
                      style={{
                        textAlign: 'left',
                        width: '100%',
                        padding: '0.3rem 0',
                        color: selectedCategory === cat.slug ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: selectedCategory === cat.slug ? 600 : 400
                      }}
                    >
                      {cat.name} ({cat.productCount || 0})
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
                Max Price: {formatPrice(priceRange)}
              </h3>
              <input
                type="range"
                min="2000"
                max="20000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                onMouseUp={handlePriceApply}
                onTouchEnd={handlePriceApply}
                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                <span>{formatPrice(2000)}</span>
                <span>{formatPrice(20000)}+</span>
              </div>
            </div>

            {/* Availability Filter */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '0.8rem', color: 'var(--text-main)' }}>
                Stock Status
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', cursor: 'pointer', color: 'var(--text-body)' }}>
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
                  style={{ accentColor: 'var(--text-main)', width: '16px', height: '16px' }}
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Material Filter */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '0.8rem', color: 'var(--text-main)' }}>
                Natural Material
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['Walnut', 'Brass', 'Sheesham', 'Ceramic', 'Travertine', 'Washi Paper'].map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => updateFilter('material', materialParam === mat ? null : mat)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: materialParam === mat ? 'var(--text-main)' : '#FFFFFF',
                      color: materialParam === mat ? '#FFFFFF' : 'var(--text-body)',
                      border: '1px solid var(--border-medium)',
                      cursor: 'pointer'
                    }}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div>
            {loading ? (
              <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={28} className="spin" style={{ margin: '0 auto 1rem' }} />
                <p>Curating handcrafted collection...</p>
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-hairline)',
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
                  No editions match your filter criteria
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Try resetting your price or material selection to browse our full catalog.
                </p>
                <button type="button" className="btn-dark" onClick={clearAllFilters}>
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} onQuickView={setQuickViewProduct} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginTop: '3.5rem' }}>
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => updateFilter('page', pageNumber.toString())}
                          style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${pageParam === pageNumber ? 'var(--text-main)' : 'var(--border-hairline)'}`,
                            backgroundColor: pageParam === pageNumber ? 'var(--text-main)' : '#FFFFFF',
                            color: pageParam === pageNumber ? '#FFFFFF' : 'var(--text-main)',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <style>{`
        @media (max-width: 900px) {
          .shop-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .mobile-filter-btn {
            display: inline-flex !important;
          }
          .shop-sidebar {
            display: none;
          }
          .shop-sidebar.mobile-open {
            display: block;
            background: #FFFFFF;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border: 1px solid var(--border-hairline);
            border-radius: var(--radius-sm);
          }
        }
      `}</style>
    </div>
  );
};

export default ShopPage;
