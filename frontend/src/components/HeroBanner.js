import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HeroBanner.css';

const HeroBanner = ({ 
  backgroundImage = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=1400&h=600&fit=crop',
  title = 'Summer Collection 2024',
  subtitle = 'Discover the latest trends in fashion and lifestyle',
  ctaText = 'Shop Now',
  ctaLink = '/products',
  overlayOpacity = 0.4,
  autoplay = true,
  autoplayInterval = 5000
}) => {
  const navigate = useNavigate();
  const [isLoaded, isIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations when component mounts
    isIsLoaded(true);
  }, []);

  const handleCtaClick = () => {
    navigate(ctaLink);
  };

  return (
    <div className="hero-banner-container">
      {/* Background Image with Lazy Loading */}
      <div
        className="hero-background"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Dark Overlay */}
        <div 
          className="hero-overlay"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      {/* Content Section */}
      <div className="hero-content">
        {/* Main Heading with Slide-In Animation */}
        <div className={`hero-heading-wrapper ${isLoaded ? 'animate-in' : ''}`}>
          <h1 className="hero-title">
            {title}
          </h1>
        </div>

        {/* Subtitle with Fade-In Animation */}
        <div className={`hero-subtitle-wrapper ${isLoaded ? 'animate-in' : ''}`}>
          <p className="hero-subtitle">
            {subtitle}
          </p>
        </div>

        {/* CTA Button with Hover Effect */}
        <div className={`hero-button-wrapper ${isLoaded ? 'animate-in' : ''}`}>
          <button 
            className="hero-cta-button"
            onClick={handleCtaClick}
            aria-label={ctaText}
          >
            <span className="button-text">{ctaText}</span>
            <span className="button-arrow">→</span>
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-arrow"></div>
      </div>
    </div>
  );
};

export default HeroBanner;
