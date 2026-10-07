import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { CurrencyProvider } from './context/CurrencyContext';

// Customer Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import SearchModal from './components/SearchModal';

// Customer Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import JournalPage from './pages/JournalPage';
import ContactPage from './pages/ContactPage';

// Admin Components & Pages
import AdminLayout from './admin/layouts/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProducts from './admin/pages/AdminProducts';
import AdminProductForm from './admin/pages/AdminProductForm';
import AdminCategories from './admin/pages/AdminCategories';
import AdminOrders from './admin/pages/AdminOrders';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminCoupons from './admin/pages/AdminCoupons';
import AdminHomepage from './admin/pages/AdminHomepage';
import AdminEnquiries from './admin/pages/AdminEnquiries';

// Protected Route helper for Admins
const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Customer Layout Shell
const CustomerLayout = ({ children, onOpenSearch }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onOpenSearch={onOpenSearch} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
};

const AppContent = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Search Modal, Cart Drawer, Wishlist Drawer */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer />
      <WishlistDrawer />

      <Routes>
        {/* Admin Portal Authentication */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Workspace */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="homepage" element={<AdminHomepage />} />
        </Route>

        {/* Customer Storefront Routes */}
        <Route
          path="*"
          element={
            <CustomerLayout onOpenSearch={() => setIsSearchOpen(true)}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CustomerLayout>
          }
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;
