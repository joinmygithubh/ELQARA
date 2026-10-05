import React from 'react';

const FeaturesBar = () => {
  const features = [
    {
      id: 'materials',
      title: 'Premium Materials',
      sub: 'Only the finest, natural materials',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 4 13c0-4.42 3.58-8 8-8 0 0 1.5 4 4 6.5s6.5 4 6.5 4a7 7 0 0 1-7 7.5c-1.5 0-3-.5-4.5-2Z" />
          <path d="M12 9c0 2.5 1.5 5 4 6.5" />
        </svg>
      )
    },
    {
      id: 'artisans',
      title: 'Handcrafted by Artisans',
      sub: 'Celebrating traditional skills',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      )
    },
    {
      id: 'timeless',
      title: 'Timeless Designs',
      sub: 'Made to last, not just for trends',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      )
    },
    {
      id: 'interiors',
      title: 'For Modern Interiors',
      sub: 'Designs that feel like home',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    }
  ];

  return (
    <section className="features-bar" aria-label="Why choose ELQARA">
      <div className="container">
        <div className="features-grid">
          {features.map((item) => (
            <div key={item.id} className="feature-col">
              <div className="feature-icon-wrap">{item.icon}</div>
              <div>
                <h3 className="feature-title">{item.title}</h3>
                <p className="feature-sub">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
