import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <article className="product-card" aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <div className="product-img-wrapper shimmer-box" style={{ width: '100%', aspectRatio: '4/5' }} />
      <div className="product-info" style={{ paddingTop: '1rem' }}>
        <div className="shimmer-box" style={{ width: '35%', height: '12px', marginBottom: '0.6rem' }} />
        <div className="shimmer-box" style={{ width: '80%', height: '18px', marginBottom: '0.6rem' }} />
        <div className="shimmer-box" style={{ width: '45%', height: '14px', marginBottom: '0.6rem' }} />
        <div className="shimmer-box" style={{ width: '32%', height: '18px' }} />
      </div>
    </article>
  );
};

export default ProductCardSkeleton;
