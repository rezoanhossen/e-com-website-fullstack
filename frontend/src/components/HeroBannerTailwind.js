import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hero Banner Component - Tailwind CSS Version
 * Production-ready with full responsiveness and animations
 */
const HeroBannerTailwind = ({ 
  backgroundImage = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=1400&h=600&fit=crop',
  title = 'Summer Collection 2024',
  subtitle = 'Discover the latest trends in fashion and lifestyle',
  ctaText = 'Shop Now',
  ctaLink = '/products',
  overlayOpacity = 0.4,
  onCtaClick = null
}) => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      navigate(ctaLink);
    }
  };

  return (
    <div className="relative w-full h-screen md:h-[600px] lg:h-[700px] overflow-hidden bg-gray-200">
      {/* Background Image with Zoom Animation */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ${
          isLoaded ? 'scale-100' : 'scale-105'
        }`}
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Dark Overlay */}
        <div 
          className="absolute inset-0 bg-black transition-opacity duration-500"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full w-full px-4 md:px-8 flex flex-col items-center justify-center text-center gap-6 md:gap-8">
        
        {/* Main Heading with Slide-In Animation */}
        <div
          className={`transform transition-all duration-800 ease-out ${
            isLoaded 
              ? 'translate-x-0 opacity-100' 
              : '-translate-x-20 opacity-0'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight md:leading-tight drop-shadow-lg max-w-5xl mx-auto">
            {title}
          </h1>
        </div>

        {/* Subtitle with Fade-In Animation */}
        <div
          className={`transform transition-all duration-800 ease-out delay-200 ${
            isLoaded 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-3 opacity-0'
          }`}
        >
          <p className="text-base sm:text-lg md:text-xl text-white text-opacity-90 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* CTA Button with Hover Animation */}
        <div
          className={`transform transition-all duration-800 ease-out delay-300 ${
            isLoaded 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-5 opacity-0'
          }`}
        >
          <button
            onClick={handleCtaClick}
            className="inline-flex items-center gap-2 md:gap-3 px-6 sm:px-8 md:px-10 py-3 md:py-4 bg-orange-500 hover:bg-orange-600 text-gray-900 font-bold uppercase text-sm md:text-base tracking-wide rounded transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 shadow-lg group"
            aria-label={ctaText}
          >
            <span>{ctaText}</span>
            <span className="text-lg md:text-xl transform group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          </button>
        </div>
      </div>

      {/* Scroll Indicator (Hidden on Mobile) */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 justify-center opacity-70 hover:opacity-100 transition-opacity duration-300">
        <div className="animate-bounce">
          <svg
            className="w-6 h-6 text-white transform rotate-45"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeroBannerTailwind;
