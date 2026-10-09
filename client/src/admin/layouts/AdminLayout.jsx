import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Home,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products & Editions', icon: Package },
    { to: '/admin/categories', label: 'Disciplines & Categories', icon: Layers },
    { to: '/admin/orders', label: 'Orders & Shipments', icon: ShoppingBag },
    { to: '/admin/enquiries', label: 'Client Enquiries', icon: MessageSquare },
    { to: '/admin/customers', label: 'Collectors / Customers', icon: Users },
    { to: '/admin/coupons', label: 'Coupons & Promotions', icon: Tag },
    { to: '/admin/homepage', label: 'Homepage Settings', icon: Home }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" target="_blank" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', letterSpacing: '0.12em', color: '#FAF7F2', display: 'block' }}>
              ELQARA
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--accent-gold)' }}>
              ATELIER MANAGEMENT PORTAL
            </span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom User Bar */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                Master Access
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to="/"
              target="_blank"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                padding: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#FFF',
                borderRadius: 'var(--radius-xs)'
              }}
            >
              <span>View Store</span>
              <ExternalLink size={12} />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem 0.8rem',
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                color: '#F87171',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer'
              }}
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>ELQARA Atelier</span>
            <ChevronRight size={13} />
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Administration Portal</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                color: 'var(--accent-gold)',
                fontWeight: 600
              }}
            >
              <span>Customer Website</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </header>

        {/* Nested Page View */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
