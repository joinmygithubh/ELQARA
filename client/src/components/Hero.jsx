import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import heroBannerImg from '../assets/images/hero-banner.webp';
import slide2Img from '../assets/images/slider-1.webp';
import slide3Img from '../assets/images/slider-2.webp';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      setCurrentSlide((prev) => (prev + 1) % 3);
    } else if (distance < -50) {
      setCurrentSlide((prev) => (prev - 1 + 3) % 3);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="hero-slider-section"
      aria-label="Hero Spotlight Slider"
      style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="hero-slider-track"
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'stretch',
          transform: `translateX(-${currentSlide * 100}%)`,
          transition: 'transform 850ms cubic-bezier(0.25, 1, 0.5, 1)',
          willChange: 'transform'
        }}
      >
        {/* Slide 1: Primary Above-The-Fold Hero Image (Highest Priority LCP) */}
        <div style={{ flex: '0 0 100%', width: '100%', minWidth: '100%', position: 'relative' }}>
          <div className="hero-banner-section">
            <img
              src={heroBannerImg}
              alt="ELQARA - Objects for Living - Timeless Decor for Modern Spaces"
              className="hero-banner-bg"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width="1600"
              height="800"
            />
            <div className="hero-banner-overlay" />
            <div className="container hero-banner-container">
              <div className="hero-banner-content">
                <div className="hero-banner-brand-block">
                  <span className="hero-banner-brand">ELQARA</span>
                  <span className="hero-banner-brand-sub">Objects for Living</span>
                  <div className="hero-banner-divider" />
                </div>

                <h1 className="hero-banner-heading">
                  Timeless Decor<br />for Modern Spaces
                </h1>

                <p className="hero-banner-text">
                  Explore handcrafted home décor and lighting that bring warmth, character and elegance to your everyday spaces.
                </p>

                <Link to="/shop" className="hero-banner-btn">
                  <span>EXPLORE COLLECTION</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2: Clean photo only */}
        <div style={{ flex: '0 0 100%', width: '100%', minWidth: '100%', position: 'relative' }}>
          <div className="hero-banner-section" style={{ padding: 0 }}>
            <img
              src={slide2Img}
              alt="ELQARA Handcrafted Travertine Table Lamp"
              className="hero-banner-bg"
              loading="lazy"
              decoding="async"
              width="1600"
              height="800"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
          </div>
        </div>

        {/* Slide 3: Clean photo only */}
        <div style={{ flex: '0 0 100%', width: '100%', minWidth: '100%', position: 'relative' }}>
          <div className="hero-banner-section" style={{ padding: 0 }}>
            <img
              src={slide3Img}
              alt="ELQARA Handcrafted Fluted Wood Lamp"
              className="hero-banner-bg"
              loading="lazy"
              decoding="async"
              width="1600"
              height="800"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
