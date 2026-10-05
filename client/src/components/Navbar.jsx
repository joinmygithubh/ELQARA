import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, User, ShoppingBag, Menu, X, ChevronDown, ShieldCheck, LogOut, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import CurrencySelector from './CurrencySelector';

const Navbar = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);

  const { itemCount, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

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
            {/* Left: Brand Logo */}
            <Link to="/" className="brand-logo" aria-label="ELQARA Homepage">
              <span className="brand-name">ELQARA</span>
              <span className="brand-tagline">OBJECTS FOR LIVING</span>
            </Link>

            {/* Center: Desktop Navigation Links */}
            <ul className="nav-links" style={{ display: 'flex' }}>
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

              {/* Collections Dropdown */}
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
                      width: '240px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--border-hairline)',
                      padding: '0.75rem 0',
                      borderRadius: 'var(--radius-sm)',
                      zIndex: 1100
                    }}
                  >
                    <Link
                      to="/shop?category=table-lamps"
                      style={{
                        display: 'block',
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-body)'
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = '#FAF7F2')}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                    >
                      Table Lamps
                    </Link>
                    <Link
                      to="/shop?category=floor-lamps"
                      style={{
                        display: 'block',
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-body)'
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = '#FAF7F2')}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                    >
                      Floor Lamps
                    </Link>
                    <Link
                      to="/shop?category=pendant-lights"
                      style={{
                        display: 'block',
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-body)'
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = '#FAF7F2')}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                    >
                      Pendant Lights
                    </Link>
                    <Link
                      to="/shop?category=home-decor"
                      style={{
                        display: 'block',
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-body)'
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = '#FAF7F2')}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                    >
                      Home Décor & Objects
                    </Link>
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
                  Contact
                </NavLink>
              </li>
            </ul>

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

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                className="icon-btn mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{ display: 'none' }}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
              Shop Catalog
            </Link>
            <Link to="/shop?category=table-lamps" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Table Lamps
            </Link>
            <Link to="/shop?category=floor-lamps" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Floor Lamps
            </Link>
            <Link to="/shop?category=pendant-lights" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Pendant & Ceiling Lights
            </Link>
            <Link to="/shop?category=home-decor" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Home Décor & Objects
            </Link>
            <Link to="/about" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              About Saharanpur Heritage
            </Link>
            <Link to="/journal" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Journal & Stories
            </Link>
            <Link to="/contact" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Contact Atelier
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
        @media (max-width: 900px) {
          .nav-links {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
