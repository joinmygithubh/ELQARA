import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import heroSlide1 from '../assets/hero-slide-1.jpg';
import heroSlide2 from '../assets/hero-slide-2.jpg';
import heroSlide3 from '../assets/hero-slide-3.jpg';

const Hero = ({ customSlides }) => {
  const defaultSlides = [
    {
      id: 1,
      preheading: 'PREMIUM HOME DÉCOR & LIGHTING',
      title: 'Crafted forms.\nConsidered spaces.',
      subtitle:
        'Discover handcrafted lighting and décor that brings warmth, character and calm to your space.',
      buttonText: 'EXPLORE COLLECTION',
      buttonLink: '/shop',
      badgeText: 'Handcrafted\nin India',
      image: heroSlide1,
      slideNumber: '01'
    },
    {
      id: 2,
      preheading: 'ARCHITECTURAL ILLUMINATION',
      title: 'Subtle warmth.\nTimeless glass.',
      subtitle:
        'Fluted amber crystal and brushed brass that infuse every corner with gentle, considered radiance.',
      buttonText: 'DISCOVER LAMPS',
      buttonLink: '/shop?category=table-lamps',
      badgeText: 'Artisanal\nBrasswork',
      image: heroSlide2,
      slideNumber: '02'
    },
    {
      id: 3,
      preheading: 'SCULPTURAL LIVING',
      title: 'Graceful arcs.\nEffortless calm.',
      subtitle:
        'Elevate expansive living rooms with solid walnut arcs and hand-blown opaline diffusers.',
      buttonText: 'VIEW FLOOR LAMPS',
      buttonLink: '/shop?category=floor-lamps',
      badgeText: 'Saharanpur\nCraft',
      image: heroSlide3,
      slideNumber: '03'
    }
  ];

  const slides = customSlides && customSlides.length > 0 ? customSlides : defaultSlides;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto advance slides gently every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const activeSlideData = slides[currentSlide] || slides[0];

  return (
    <section className="hero-wrapper" aria-label="Hero Spotlight">
      {/* Slides Background */}
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
        >
          <img
            src={slide.image || heroSlide1}
            alt={slide.title.replace('\n', ' ')}
            className="hero-bg-img"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          <div className="hero-gradient" />
        </div>
      ))}

      {/* Hero Content Overlay */}
      <div className="container hero-content-container">
        {/* Top-Right Handcrafted Badge matching reference UI */}
        <div className="hero-handcrafted-badge">
          <div className="hero-handcrafted-line" />
          <div className="hero-handcrafted-text">
            {activeSlideData.badgeText.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>

        {/* Center-Left Editorial Typography & CTA */}
        <div className="hero-editorial-box">
          <div className="pre-heading white">
            {activeSlideData.preheading}
          </div>

          <h1 className="hero-title">
            {activeSlideData.title.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'block' }}>
                {line}
              </span>
            ))}
          </h1>

          <p className="hero-subtitle">
            {activeSlideData.subtitle}
          </p>

          <Link
            to={activeSlideData.buttonLink || '/shop'}
            className="btn-primary"
            style={{ borderRadius: '2px' }}
          >
            <span>{activeSlideData.buttonText}</span>
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Bottom Left Controls: "01 —— 03" with slider and circular arrow buttons */}
        <div className="hero-controls">
          <div className="hero-pagination">
            <span>0{currentSlide + 1}</span>
            <div className="hero-progress-line">
              <div
                className="hero-progress-active"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              />
            </div>
            <span>0{slides.length}</span>
          </div>

          <div className="hero-arrow-btns">
            <button
              type="button"
              className="btn-icon-circle"
              onClick={prevSlide}
              aria-label="Previous Slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="btn-icon-circle"
              onClick={nextSlide}
              aria-label="Next Slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
