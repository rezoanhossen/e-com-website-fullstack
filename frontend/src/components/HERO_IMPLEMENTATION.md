/**
 * HERO BANNER INTEGRATION GUIDE
 * How to add the hero banner to your existing Home page
 */

// ============================================
// STEP 1: ADD TO IMPORTS
// ============================================

import React, { useEffect, useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import { useAuth } from '../context/AuthContext';

// ============================================
// STEP 2: UPDATE HOME.JS
// ============================================

const Home = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=12&featured=true');
      const data = await response.json();
      setFeaturedProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ===== NEW: HERO BANNER ===== */}
      <HeroBanner
        backgroundImage="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&h=700&fit=crop"
        title="Welcome to Our Premium Store"
        subtitle="Discover handpicked items curated just for you"
        ctaText="Start Shopping"
        ctaLink="/products"
        overlayOpacity={0.35}
      />
      {/* ===== END HERO BANNER ===== */}

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Featured Products
          </h2>
          <p className="text-gray-600 text-lg">
            Browse our handpicked collection of premium items
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 h-64 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300"
              >
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{product.price}
                    </span>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition">
                      Shop
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Get Exclusive Offers
          </h2>
          <p className="text-orange-100 mb-8">
            Subscribe to our newsletter for special discounts and updates
          </p>
          <form className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
            <button
              type="submit"
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded font-semibold transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
          What Our Customers Say
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: 'Sarah Johnson',
              rating: 5,
              comment: 'Amazing quality and fast shipping! Highly recommend.',
            },
            {
              name: 'Mike Chen',
              rating: 5,
              comment: 'Great customer service and excellent products.',
            },
            {
              name: 'Emily Davis',
              rating: 5,
              comment: 'Best place to shop online. Will be back soon!',
            },
          ].map((review, i) => (
            <div key={i} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                {[...Array(review.rating)].map((_, j) => (
                  <span key={j} className="text-yellow-400 text-xl">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-4">"{review.comment}"</p>
              <p className="text-gray-900 font-semibold">{review.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
            Why Choose Us?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🚚', title: 'Free Shipping', text: 'On orders over ₹500' },
              { icon: '💰', title: 'Best Price', text: 'Guaranteed lowest prices' },
              { icon: '🛡️', title: 'Secure', text: '100% secure transactions' },
              { icon: '⭐', title: 'Quality', text: 'Premium products only' },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

// ============================================
// STEP 3: UPDATE HOME.CSS (If Needed)
// ============================================

/*
No additional CSS needed!
The HeroBanner component includes all its own styling.
Just import HeroBannerCSS file or HeroBanner.css is auto-imported.
*/

// ============================================
// STEP 4: CUSTOMIZE HERO BANNER
// ============================================

/*

SIMPLE CUSTOMIZATIONS:

Change background image:
<HeroBanner
  backgroundImage="YOUR_IMAGE_URL"
  ...
/>

Change title and subtitle:
<HeroBanner
  title="Your Custom Title"
  subtitle="Your custom subtitle"
  ...
/>

Change button text and link:
<HeroBanner
  ctaText="Browse Now"
  ctaLink="/shop"
  ...
/>

Make overlay darker:
<HeroBanner
  overlayOpacity={0.6}  // Increased from 0.35
  ...
/>

*/

// ============================================
// STEP 5: DYNAMIC HERO BANNER (Optional)
// ============================================

/*

If you want to fetch hero banner data from API:

const [heroData, setHeroData] = useState({
  backgroundImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&h=700&fit=crop',
  title: 'Welcome to Our Store',
  subtitle: 'Discover amazing products',
  ctaText: 'Shop Now',
  ctaLink: '/products'
});

useEffect(() => {
  fetch('/api/hero-banner')
    .then(r => r.json())
    .then(data => setHeroData(data));
}, []);

// Then use:
<HeroBanner {...heroData} />

*/

// ============================================
// STEP 6: MULTIPLE HERO BANNERS
// ============================================

/*

If you want rotating banners:

const [bannerIndex, setBannerIndex] = useState(0);

const banners = [
  {
    backgroundImage: 'url1',
    title: 'Banner 1',
    ...
  },
  {
    backgroundImage: 'url2',
    title: 'Banner 2',
    ...
  }
];

useEffect(() => {
  const interval = setInterval(() => {
    setBannerIndex(prev => (prev + 1) % banners.length);
  }, 5000); // Change every 5 seconds
  return () => clearInterval(interval);
}, []);

// Then use:
<HeroBanner key={bannerIndex} {...banners[bannerIndex]} />

*/

// ============================================
// AVAILABLE IMAGE SOURCES
// ============================================

/*

Free high-quality images:

Unsplash:
- Product showcase: https://images.unsplash.com/photo-1557821552-17105176677c?w=1400&h=700&fit=crop
- Fashion: https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&h=700&fit=crop
- Shopping: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1400&h=700&fit=crop
- Modern tech: https://images.unsplash.com/photo-1557821552-17105176677c?w=1400&h=700&fit=crop

Pexels:
- Professional: https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?w=1400&h=700

Pixabay via CDN:
- Shopping: https://pixabay.com/get/... (various)

Use your own:
- Upload to Cloudinary, AWS S3, or similar
- Use absolute URL in backgroundImage prop

*/

// ============================================
// TROUBLESHOOTING CHECKLIST
// ============================================

/*

✅ Hero banner not showing?
- Check HeroBanner.js is in components folder
- Check HeroBanner.css is in styles folder
- Import statement: import HeroBanner from '../components/HeroBanner'
- Check background image URL is valid

✅ Animations not working?
- Check HeroBanner.css is imported
- Check browser supports CSS animations
- Try disabling browser extensions
- Check console for CSS errors

✅ Button not working?
- Check React Router is configured
- Verify ctaLink prop is set
- Check navigate function is working
- Test in browser console

✅ Mobile layout broken?
- Check viewport meta tag in public/index.html
- Clear browser cache
- Test in actual mobile device
- Check CSS media queries are loaded

✅ Image not loading?
- Check image URL is accessible
- Check CORS headers if cross-origin
- Try different image URL
- Check image file size

*/

// ============================================
// NEXT STEPS
// ============================================

/*

1. Copy HeroBanner.js to frontend/src/components/
2. Copy HeroBanner.css to frontend/src/styles/
3. Import HeroBanner in Home.js
4. Update <Home> return to include <HeroBanner />
5. Replace background image with your own
6. Update title, subtitle, and button text
7. Test in browser
8. Customize colors in HeroBanner.css if needed
9. Deploy to production

Time to implement: 5-10 minutes
*/
