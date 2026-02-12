# Hero Banner - Copy-Paste Examples

Quick copy-paste code for common scenarios. Just replace the placeholder values.

---

## 1. Basic Hero Banner

```jsx
import HeroBanner from '../components/HeroBanner';

export default function Home() {
  return (
    <>
      <HeroBanner />
      {/* Rest of your page */}
    </>
  );
}
```

**Output:** Default summer collection banner

---

## 2. Summer Sale Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&h=700&fit=crop"
  title="Summer Sale - Up to 50% Off"
  subtitle="Limited time offer on selected items. Shop now before they're gone!"
  ctaText="Shop Sale"
  ctaLink="/products?category=sale"
  overlayOpacity={0.4}
/>
```

---

## 3. New Collection Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1533655173570-f73ee25985f0?w=1400&h=700&fit=crop"
  title="New Collection Launched"
  subtitle="Be the first to explore our latest designs and trends"
  ctaText="View New"
  ctaLink="/products?sort=newest"
  overlayOpacity={0.35}
/>
```

---

## 4. Premium/VIP Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1556821552-38fb0ca8a8d2?w=1400&h=700&fit=crop"
  title="Exclusive Premium Collection"
  subtitle="Experience luxury with our curated selection of premium products"
  ctaText="Explore Premium"
  ctaLink="/premium"
  overlayOpacity={0.45}
/>
```

---

## 5. Back to School Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1488821689569-88062664fb78?w=1400&h=700&fit=crop"
  title="Back to School Sale"
  subtitle="Get everything you need for a successful school year"
  ctaText="Shop School"
  ctaLink="/products?category=school"
  overlayOpacity={0.4}
/>
```

---

## 6. Flash Deal Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1557821552-17105176677c?w=1400&h=700&fit=crop"
  title="⚡ Flash Deal - 24 Hours Only"
  subtitle="Incredible discounts on top products. Hurry, stock is limited!"
  ctaText="Grab Deal"
  ctaLink="/flash-deal"
  overlayOpacity={0.5}
/>
```

---

## 7. Clearance Sale Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1400&h=700&fit=crop"
  title="Clearance Sale Now On"
  subtitle="Up to 70% off on clearance items - Final sale items included"
  ctaText="Start Clearance"
  ctaLink="/clearance"
  overlayOpacity={0.55}
/>
```

---

## 8. Festival/Holiday Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1577720643272-265b34d9b306?w=1400&h=700&fit=crop"
  title="Festival Celebrations"
  subtitle="Celebrate with exclusive festive offers and special bundles"
  ctaText="Celebrate Now"
  ctaLink="/festival"
  overlayOpacity={0.35}
/>
```

---

## 9. Free Shipping Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1565430304241-1f5b937fc89f?w=1400&h=700&fit=crop"
  title="Free Shipping On All Orders"
  subtitle="No minimum purchase required. Delivery to your doorstep"
  ctaText="Start Shopping"
  ctaLink="/products"
  overlayOpacity={0.4}
/>
```

---

## 10. Member Exclusive Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1546868871-7541df60d0d9?w=1400&h=700&fit=crop"
  title="Member Exclusive"
  subtitle="Get special perks, early access, and exclusive deals"
  ctaText="Join Now"
  ctaLink="/membership"
  overlayOpacity={0.45}
/>
```

---

## 11. Brand Partnership Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1556821552-7f41c5d76da2?w=1400&h=700&fit=crop"
  title="Now Featuring Nike"
  subtitle="Exclusive partnership bringing authentic Nike products to you"
  ctaText="Shop Nike"
  ctaLink="/brands/nike"
  overlayOpacity={0.35}
/>
```

---

## 12. Limited Edition Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1552062407-d08ca6c7a1ba?w=1400&h=700&fit=crop"
  title="Limited Edition Collection"
  subtitle="Only a few pieces available. Collectors items for enthusiasts"
  ctaText="View Collection"
  ctaLink="/limited-edition"
  overlayOpacity={0.5}
/>
```

---

## 13. Product Category Banner - Electronics

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=1400&h=700&fit=crop"
  title="Latest Electronics"
  subtitle="Cutting-edge technology at competitive prices"
  ctaText="Shop Electronics"
  ctaLink="/products?category=electronics"
  overlayOpacity={0.4}
/>
```

---

## 14. Product Category Banner - Fashion

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1479064555552-3ef4979005a7?w=1400&h=700&fit=crop"
  title="Fashion Forward"
  subtitle="Trendy clothing and accessories for every style"
  ctaText="Shop Fashion"
  ctaLink="/products?category=fashion"
  overlayOpacity={0.35}
/>
```

---

## 15. Product Category Banner - Home

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&h=700&fit=crop"
  title="Home & Living"
  subtitle="Transform your space with beautiful home décor and furniture"
  ctaText="Shop Home"
  ctaLink="/products?category=home"
  overlayOpacity={0.4}
/>
```

---

## 16. Welcome Back Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1563381013529-667a2bfb91fe?w=1400&h=700&fit=crop"
  title="Welcome Back!"
  subtitle="We've added new features and amazing products since your last visit"
  ctaText="See What's New"
  ctaLink="/whats-new"
  overlayOpacity={0.35}
/>
```

---

## 17. Loyalty Program Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1400&h=700&fit=crop"
  title="Earn Rewards"
  subtitle="Join our loyalty program and earn points on every purchase"
  ctaText="Join Rewards"
  ctaLink="/loyalty"
  overlayOpacity={0.4}
/>
```

---

## 18. Bundle Offer Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1595521624062-46de8e00f1dc?w=1400&h=700&fit=crop"
  title="Bundle & Save"
  subtitle="Get more value with our bundle deals - Save up to 35%"
  ctaText="Shop Bundles"
  ctaLink="/bundles"
  overlayOpacity={0.45}
/>
```

---

## 19. Trending Products Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1557821552-17105176677c?w=1400&h=700&fit=crop"
  title="Trending Now"
  subtitle="See what's trending with customers right now"
  ctaText="Shop Trending"
  ctaLink="/trending"
  overlayOpacity={0.4}
/>
```

---

## 20. Best Sellers Banner

```jsx
<HeroBanner
  backgroundImage="https://images.unsplash.com/photo-1556821552-7f41c5d76da2?w=1400&h=700&fit=crop"
  title="Best Sellers"
  subtitle="Discover the products loved by thousands of customers"
  ctaText="View Best Sellers"
  ctaLink="/best-sellers"
  overlayOpacity={0.35}
/>
```

---

## React Component Integration Example

```jsx
import React, { useState, useEffect } from 'react';
import HeroBanner from '../components/HeroBanner';

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Rotating banners (one every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % bannerConfigs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const bannerConfigs = [
    {
      backgroundImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&h=700&fit=crop',
      title: 'Summer Sale - 50% Off',
      subtitle: 'Limited time offer on selected items',
      ctaText: 'Shop Sale',
      ctaLink: '/sale'
    },
    {
      backgroundImage: 'https://images.unsplash.com/photo-1533655173570-f73ee25985f0?w=1400&h=700&fit=crop',
      title: 'New Collection Launched',
      subtitle: 'Be the first to explore our latest designs',
      ctaText: 'View New',
      ctaLink: '/new'
    },
    {
      backgroundImage: 'https://images.unsplash.com/photo-1556821552-38fb0ca8a8d2?w=1400&h=700&fit=crop',
      title: 'Premium Collection',
      subtitle: 'Experience luxury like never before',
      ctaText: 'Shop Premium',
      ctaLink: '/premium'
    }
  ];

  return (
    <div>
      <HeroBanner key={currentBanner} {...bannerConfigs[currentBanner]} />
      
      {/* Rest of page */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold mb-8">Featured Products</h2>
        {/* Your products here */}
      </section>
    </div>
  );
}
```

---

## Customizing Image Sources

### Using Your Own Images

```jsx
// Local image (copy to public/images/hero.jpg)
<HeroBanner backgroundImage="/images/hero.jpg" />

// Cloud storage (Cloudinary example)
<HeroBanner 
  backgroundImage="https://res.cloudinary.com/your-cloud/image/upload/w_1400,h_700/banner.jpg"
/>

// AWS S3 example
<HeroBanner 
  backgroundImage="https://your-bucket.s3.amazonaws.com/hero-banner.jpg"
/>

// Image from your API
const [bannerImage, setBannerImage] = useState('');
useEffect(() => {
  fetch('/api/hero-image')
    .then(r => r.json())
    .then(data => setBannerImage(data.imageUrl));
}, []);
return <HeroBanner backgroundImage={bannerImage} />;
```

---

## Responsive Image Selection

```jsx
import { useWindowSize } from '../hooks/useWindowSize';

export default function Home() {
  const { width } = useWindowSize();

  const backgroundImage = width < 768 
    ? 'https://your-site.com/hero-mobile.jpg'
    : 'https://your-site.com/hero-desktop.jpg';

  return <HeroBanner backgroundImage={backgroundImage} />;
}
```

---

## Tips & Tricks

### Tip 1: Match Your Brand Colors
```jsx
// Edit HeroBanner.css
:root {
  --accent-color: #your-color;
  --hover-color: #darker-shade;
}
```

### Tip 2: Change Heading Level for SEO
```jsx
// Modify HeroBanner.js line with <h1>
// Change to <h2> if h1 is used elsewhere
<h2 className="hero-title">{title}</h2>
```

### Tip 3: Add Analytics Tracking
```jsx
// Modify HeroBanner.js
const handleCtaClick = () => {
  // Track event
  window.gtag?.event('hero_cta_click', {
    banner_title: title,
    cta_text: ctaText
  });
  navigate(ctaLink);
};
```

### Tip 4: A/B Test Different Headlines
```jsx
const [headline, setHeadline] = useState('Option A');
<HeroBanner title={headline} ... />
// Change headline and track which performs better
```

### Tip 5: Schedule Seasonal Banners
```jsx
const getSeasonalBanner = () => {
  const month = new Date().getMonth();
  if (month === 11) return christmasBanner; // December
  if (month === 0) return newYearBanner;    // January
  return defaultBanner;
};

return <HeroBanner {...getSeasonalBanner()} />;
```

---

## Production Checklist

- [ ] Image is optimized (< 100KB)
- [ ] Image is responsive (1400x700 recommended)
- [ ] Heading is clear and concise
- [ ] CTA button links to correct page
- [ ] Overlay opacity allows text readability
- [ ] Tested on mobile, tablet, desktop
- [ ] Tested in all major browsers
- [ ] Accessibility checked (contrast, focus states)
- [ ] Analytics tracking added
- [ ] Deployed to production

---

**All examples are production-ready and copy-paste ready!**
