import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { couponAPI } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('elqara_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('elqara_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('elqara_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('elqara_applied_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('elqara_applied_coupon');
    }
  }, [coupon]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product === product._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Only ${product.stock} items available in stock`, 'error');
          return prev;
        }
        updated[existingIndex].quantity = newQty;
        showToast(`Updated "${product.name}" quantity (${newQty})`, 'success');
        return updated;
      } else {
        showToast(`Added "${product.name}" to bag`, 'success');
        return [
          ...prev,
          {
            product: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            mrp: product.mrp,
            image: product.thumbnail || (product.images && product.images[0]) || '',
            sku: product.sku,
            stock: product.stock,
            quantity
          }
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product !== productId));
    showToast('Item removed from your bag', 'info');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product === productId) {
          if (quantity > item.stock) {
            showToast(`Maximum available stock is ${item.stock}`, 'error');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem('elqara_cart');
    localStorage.removeItem('elqara_applied_coupon');
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = subtotal === 0 || subtotal >= 1999 ? 0 : 199;

  let discountAmount = 0;
  if (coupon && subtotal > 0) {
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  const applyCoupon = async (code) => {
    try {
      const res = await couponAPI.validate({ code, orderTotal: subtotal });
      if (res.data?.success) {
        setCoupon(res.data.coupon);
        showToast(res.data.message, 'success');
        return true;
      }
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    showToast('Coupon removed', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        subtotal,
        shippingFee,
        discountAmount,
        totalAmount,
        coupon,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
