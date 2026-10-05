import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { showToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('elqara_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('elqara_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => (item._id || item.product) === productId);
  };

  const toggleWishlist = (product) => {
    const id = product._id || product.product;
    if (isInWishlist(id)) {
      setWishlistItems((prev) => prev.filter((item) => (item._id || item.product) !== id));
      showToast(`Removed "${product.name}" from wishlist`, 'info');
    } else {
      setWishlistItems((prev) => [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          mrp: product.mrp,
          discount: product.discount,
          thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
          stock: product.stock,
          categoryName: product.categoryName || product.category?.name
        }
      ]);
      showToast(`Saved "${product.name}" to wishlist`, 'success');
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => (item._id || item.product) !== productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isWishlistOpen,
        openWishlist: () => setIsWishlistOpen(true),
        closeWishlist: () => setIsWishlistOpen(false),
        isInWishlist,
        toggleWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
