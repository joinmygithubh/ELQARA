import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, User, ShoppingBag, Menu, X, ChevronDown, ShieldCheck, LogOut, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { categoryAPI } from '../services/api';
import CurrencySelector from './CurrencySelector';

const Navbar = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const { itemCount, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    categoryAPI.getAll().then((res) => {
      if (res.data?.success && res.data.categories) {
        setCategories(res.data.categories);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
    setIsCollectionsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Split categories for luxury mega-dropdown
  const lightingCategories = categories.filter((c) =>
    ['table-lamps', 'floor-lamps', 'pendant-lights', 'wall-lights', 'desk-lamps', 'ceiling-lights', 'bedside-lamps', 'decorative-lamps', 'led-lighting', 'smart-lighting'].includes(c.slug)
  );
  const decorCategories = categories.filter((c) =>
    ['night-lights', 'ambient-lighting', 'candle-lamps', 'lighting-accessories', 'home-decor'].includes(c.slug)
  );

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        {/* Top Announcement Bar */}
        <div className="announcement-bar">
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              position: 'relative'
            }}
          >
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span>Complimentary shipping on handcrafted orders above {formatPrice(1999)}</span>
              <Link to="/shop">EXPLORE EDITIONS →</Link>
            </div>
            <div style={{ flexShrink: 0 }}>
              <CurrencySelector variant="header" />
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="container">
          <nav className="nav-inner" aria-label="Main Navigation">
            {/* Left: Navigation Links & Mobile Toggle */}
            <div className="nav-left">
              {/* Mobile Menu Hamburger Toggle */}
              <button
                type="button"
                className="icon-btn mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              {/* Desktop Navigation Links */}
              <ul className="nav-links">
                <li>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/shop"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Shop
                  </NavLink>
                </li>

                {/* Collections Dynamic Mega-Dropdown */}
                <li
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setIsCollectionsOpen(true)}
                  onMouseLeave={() => setIsCollectionsOpen(false)}
                >
                  <button
                    type="button"
                    className="nav-link"
                    aria-expanded={isCollectionsOpen}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    Collections <ChevronDown size={14} />
                  </button>

                  {isCollectionsOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        width: '460px',
                        backgroundColor: '#FFFFFF',
                        boxShadow: 'var(--shadow-xl, 0 20px 40px rgba(0,0,0,0.12))',
                        border: '1px solid var(--border-hairline)',
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-sm)',
                        zIndex: 1100,
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1fr',
                        gap: '1.25rem'
                      }}
                    >
                      {/* Column 1: Lighting Disciplines */}
                      <div>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--accent-gold)',
                            display: 'block',
                            marginBottom: '0.6rem'
                          }}
                        >
                          Lighting Disciplines
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {(lightingCategories.length > 0 ? lightingCategories : categories.slice(0, 7)).map((cat) => (
                            <Link
                              key={cat._id || cat.slug}
                              to={`/shop?category=${cat.slug}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.35rem 0.5rem',
                                fontSize: '0.82rem',
                                color: 'var(--text-body)',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                transition: 'background 120ms ease'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF7F2')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <span>{cat.name}</span>
                              {cat.productCount !== undefined && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cat.productCount}</span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Column 2: Home Decor & Objects */}
                      <div style={{ borderLeft: '1px solid var(--border-hairline)', paddingLeft: '1.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--accent-gold)',
                            display: 'block',
                            marginBottom: '0.6rem'
                          }}
                        >
                          Decor & Atmosphere
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {(decorCategories.length > 0 ? decorCategories : categories.slice(7)).map((cat) => (
                            <Link
                              key={cat._id || cat.slug}
                              to={`/shop?category=${cat.slug}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.35rem 0.5rem',
                                fontSize: '0.82rem',
                                color: 'var(--text-body)',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                transition: 'background 120ms ease'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF7F2')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <span>{cat.name}</span>
                              {cat.productCount !== undefined && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cat.productCount}</span>
                              )}
                            </Link>
                          ))}
                        </div>

                        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)' }}>
                          <Link
                            to="/shop"
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: 'var(--text-main)',
                              display: 'block'
                            }}
                          >
                            View All 15 Disciplines →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </li>

                <li>
                  <NavLink
                    to="/about"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    About
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/journal"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Journal
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/contact"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Trade & Projects
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Center: Brand Logo (Mathematically Centered to Viewport) */}
            <Link to="/" className="brand-logo" aria-label="ELQARA Homepage">
              <span className="brand-name">ELQARA</span>
              <span className="brand-tagline">OBJECTS FOR LIVING</span>
            </Link>

            {/* Right: Actions (Search | Wishlist, Account, Cart) */}
            <div className="nav-actions">
              {/* Search Icon */}
              <button
                type="button"
                className="icon-btn"
                onClick={onOpenSearch}
                aria-label="Search lamps and decor"
              >
                <Search size={19} strokeWidth={1.5} />
              </button>

              {/* Vertical divider line */}
              <div className="nav-divider" />

              {/* Wishlist Icon */}
              <button
                type="button"
                className="icon-btn"
                onClick={openWishlist}
                aria-label="View Wishlist"
              >
                <Heart size={19} strokeWidth={1.5} />
                <span className="badge-count">{wishlistCount}</span>
              </button>

              {/* User Account Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  aria-label="User Account"
                >
                  <User size={19} strokeWidth={1.5} />
                </button>

                {isAccountMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '130%',
                      right: 0,
                      width: '220px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.6rem 0',
                      zIndex: 1200
                    }}
                  >
                    {isAuthenticated ? (
                      <>
                        <div
                          style={{
                            padding: '0.6rem 1.25rem',
                            borderBottom: '1px solid var(--border-hairline)',
                            marginBottom: '0.4rem'
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Signed in as</div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.name}
                          </div>
                        </div>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              padding: '0.6rem 1.25rem',
                              fontSize: '0.85rem',
                              color: 'var(--accent-gold)',
                              fontWeight: 600
                            }}
                          >
                            <ShieldCheck size={16} /> Admin Portal
                          </Link>
                        )}

                        <Link
                          to="/account"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.6rem 1.25rem',
                            fontSize: '0.85rem',
                            color: 'var(--text-body)'
                          }}
                        >
                          <Package size={16} /> My Orders & Profile
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.6rem 1.25rem',
                            fontSize: '0.85rem',
                            color: '#DC2626',
                            textAlign: 'left'
                          }}
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          style={{
                            display: 'block',
                            padding: '0.65rem 1.25rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--text-main)'
                          }}
                        >
                          Sign In / Register
                        </Link>
                        <div style={{ height: '1px', background: 'var(--border-hairline)', margin: '0.3rem 0' }} />
                        <Link
                          to="/admin/login"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.25rem',
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)'
                          }}
                        >
                          <ShieldCheck size={14} /> Admin Access
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <button
                type="button"
                className="icon-btn"
                onClick={openCart}
                aria-label="View Shopping Bag"
              >
                <ShoppingBag size={19} strokeWidth={1.5} />
                <span className="badge-count">{itemCount}</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderBottom: '1px solid var(--border-medium)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/shop" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Shop Catalog (All 15 Disciplines)
            </Link>
            <div style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
                Disciplines
              </span>
              {categories.map((cat) => (
                <Link
                  key={cat._id || cat.slug}
                  to={`/shop?category=${cat.slug}`}
                  style={{ fontSize: '0.85rem', color: 'var(--text-body)', textDecoration: 'none' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {cat.name} {cat.productCount ? `(${cat.productCount})` : ''}
                </Link>
              ))}
            </div>
            <Link to="/about" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              About Saharanpur Heritage
            </Link>
            <Link to="/journal" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Journal & Stories
            </Link>
            <Link to="/contact" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Trade & Projects
            </Link>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-light)',
                marginTop: '0.5rem'
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Store Currency</span>
              <CurrencySelector variant="header" />
            </div>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 1024px) {
          .nav-links {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
