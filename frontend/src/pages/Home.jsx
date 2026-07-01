import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, CheckSquare, MessageSquare, ArrowRight, Star } from 'lucide-react';
import { apiFetch } from '../api.js';
import useSEO from '../hooks/useSEO.js';

const categories = [
  { name: 'Sandstone', image: 'https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/AB-Sandstone.png', slug: 'sandstone' },
  { name: 'Porcelain', image: 'https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/CA-Porc-Tiles-300x300.png', slug: 'porcelain' },
  { name: 'Bricks', image: '/images/half-round-bricks.png', slug: 'bricks' }
];

const reviews = [
  {
    name: "David L. from Wirral",
    rating: 5,
    comment: "Outstanding quality sandstone. Delivered exactly when requested, and the color variations are stunning. Highly recommend JMD!"
  },
  {
    name: "Sarah M. from Southampton",
    rating: 5,
    comment: "Extremely premium look! The porcelain paving has a beautiful anti-slip texture and looks perfect on our modern patio."
  },
  {
    name: "James K. from Chester",
    rating: 5,
    comment: "Very pleased with the County Anthracite porcelain. Be sure to prime it correctly before laying. Great customer service from Roopesh."
  }
];

const spotlightProducts = [
  {
    name: "County Anthracite Porcelain",
    title: "The Wirral Poolside & Terrace Residence",
    text: "For this modern coastal project, the architects selected JMD's County Anthracite Porcelain paving slabs. Featuring straight-sawn calibrated edges and a premium textured, anti-slip surface, this vitrified porcelain delivers clean lines and sophisticated dark tones.",
    image: "/images/county-anthracite.png",
    slug: "county-anthracite-porcelain-paving-slabs-900x600mm",
    attributes: "R11 Slip rating | Vitrified"
  },
  {
    name: "Raj Green Indian Sandstone",
    title: "The Cheshire Manor Restoration",
    text: "An elegant country garden terrace paved with Raj Green Indian Sandstone. The natural riven surface texture and forest green/sage tones blend beautifully with the traditional architecture, providing a highly durable, character-filled outdoor area.",
    image: "/images/raj-green-sandstone.png",
    slug: "raj-green-indian-sandstone-paving-slabs-project-pack-18-9m2",
    attributes: "22mm Calibrated | Natural Riven"
  },
  {
    name: "Persia Beige Porcelain",
    title: "Modern Courtyard Oasis",
    text: "A sleek, light-toned courtyard utilizing Persia Beige Porcelain. With its warm cream tones and subtle natural stone veining, it creates an expansive, bright feeling, requiring near-zero maintenance and offering excellent slip resistance.",
    image: "/images/persia-beige.jpg",
    slug: "persia-beige-porcelain-paving-slabs-900x600mm",
    attributes: "Vitrified Outdoor | Low Absorption"
  }
];

export default function Home({ addToCart }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    home_hero_headline: "Enduring Stone.",
    home_hero_subheadline: "Architectural Form.",
    home_hero_text: "We source premium paving slabs directly from quarry beds, supplying calibrated Indian Sandstone and Vitrified Porcelain flags. Crafted to weather gracefully for generations.",
    trust_bar: [
      "£49 Flat Rate UK Delivery",
      "Direct Imported Best Quality",
      "Ready for Fast Dispatch",
      "Yard Managers on Call"
    ]
  });

  useSEO({
    title: 'Buy Paving Slabs UK | Indian Sandstone, Porcelain & Natural Stone',
    description: 'Shop premium Indian Sandstone, Porcelain, Limestone, Slate and Natural Stone Paving. UK-wide delivery. Trade & retail prices. Family-run importer. Free samples available.',
    canonical: 'https://jmdglobalstones.co.uk/'
  });

  useEffect(() => {
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Buy premium sandstone and porcelain paving slabs in the UK. Raj Green, Kandla Grey and porcelain patio slabs with direct-import pricing and UK delivery.");
    
    Promise.all([
      apiFetch('/api/products').then(res => {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      }),
      apiFetch('/api/site-settings').then(res => {
        if (!res.ok) throw new Error('Failed to load settings');
        return res.json();
      })
    ])
      .then(([productsData, settingsData]) => {
        setFeaturedProducts(productsData.filter(p => p.is_featured).slice(0, 4));
        if (settingsData && Object.keys(settingsData).length > 0) {
          setSettings(prev => ({ ...prev, ...settingsData }));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching home data:', err);
        setLoading(false);
      });
  }, []);

  // Review Carousel Auto-Rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReviewIdx(prev => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Spotlight Auto-Rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setSpotlightIdx(prev => (prev + 1) % spotlightProducts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);


  if (loading) {
    return (
      <div style={{ padding: '12rem 0', textAlign: 'center', backgroundColor: 'var(--bg-light)', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-on-light)', marginBottom: '1.5rem' }}>
          JMD GLOBAL STONES
        </div>
        <div style={{ fontSize: '0.85rem', letterSpacing: '0.05em', color: 'var(--text-muted-on-light)' }}>
          Loading premium architectural materials...
        </div>
      </div>
    );
  }

  return (
    <div className="home-container" style={{ backgroundColor: 'var(--bg-light)' }}>
      
      {/* Full-bleed Hero Section - Deep Charcoal with Staggered Reveals */}
      <section style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', padding: '9rem 0', borderBottom: '1px solid var(--color-border-dark)' }}>
        <div className="container hero-layout" style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.95fr', gap: '5rem', alignItems: 'center' }}>
          
          {/* Left Column */}
          <div>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent)', display: 'block' }} className="fade-in-up">
              Direct Quarry Importers & Stockists
            </span>
            <div style={{ overflow: 'hidden', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '5rem', color: 'var(--text-on-dark)', lineHeight: 1.02, fontFamily: 'var(--font-heading)', fontWeight: 400 }} className="clip-reveal delay-1">
                {settings.home_hero_headline}
              </h1>
              <h1 style={{ fontSize: '5rem', color: 'var(--text-on-dark)', lineHeight: 1.02, fontFamily: 'var(--font-heading)', fontWeight: 400 }} className="clip-reveal delay-2">
                {settings.home_hero_subheadline}
              </h1>
            </div>
            <p style={{ color: 'var(--text-muted-on-dark)', fontSize: '1.1rem', marginBottom: '3.5rem', maxWidth: '540px', lineHeight: 1.7 }} className="fade-in-up delay-3">
              {settings.home_hero_text}
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }} className="fade-in-up delay-3">
              <Link to="/products" className="btn btn-accent">Shop Materials</Link>
              <Link to="/delivery" className="btn" style={{ borderColor: 'var(--color-border-dark)', color: 'var(--text-on-dark)' }}>Delivery Rates</Link>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }} className="fade-in-up delay-2">
            <img 
              src="/images/stone_patio_layout.png" 
              alt="Luxury Sandstone installed patio garden terrace" 
              style={{ width: '100%', maxWidth: '480px', height: '360px', objectFit: 'cover', border: '1px solid var(--color-border-dark)' }}
            />
            <div style={{ position: 'absolute', bottom: '-20px', right: '-10px', backgroundColor: 'var(--bg-dark)', padding: '1.25rem 1.75rem', border: '1px solid var(--color-border-dark)' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '0.25rem' }}>Architectural Finish</p>
              <p style={{ fontWeight: 400, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--text-on-dark)' }}>Calibrated Indian Sandstone</p>
            </div>
          </div>

        </div>
      </section>

      {/* Trust Badges - Off-White with Vertical Gold Dividers */}
      <section style={{ borderBottom: '1px solid var(--color-border-light)', padding: '3rem 0', backgroundColor: 'var(--bg-light)' }}>
        <div className="container trust-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', textAlign: 'center' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0 1rem' }} className="trust-card-item border-r">
            <Truck size={22} style={{ color: 'var(--color-accent)' }} />
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Flat Rate Delivery</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)' }}>{settings.trust_bar?.[0] || "£49 Flat Rate UK Delivery"}</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0 1rem' }} className="trust-card-item border-r">
            <ShieldCheck size={22} style={{ color: 'var(--color-accent)' }} />
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>100% Genuine Stone</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)' }}>{settings.trust_bar?.[1] || "Direct Imported Best Quality"}</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0 1rem' }} className="trust-card-item border-r">
            <CheckSquare size={22} style={{ color: 'var(--color-accent)' }} />
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>UK Yard Stock</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)' }}>{settings.trust_bar?.[2] || "Ready for Fast Dispatch"}</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0 1rem' }} className="trust-card-item">
            <MessageSquare size={22} style={{ color: 'var(--color-accent)' }} />
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Expert Guidance</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)' }}>{settings.trust_bar?.[3] || "Yard Managers on Call"}</p>
          </div>

        </div>
      </section>

      {/* Shop by Category Section - Editorial Overlapping Layout */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em' }}>Curated Collections</span>
            <h2 style={{ fontSize: '2.8rem', marginTop: '0.75rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Shop by Category</h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', paddingBottom: '2rem' }}>
            {categories.map((cat, idx) => (
              <Link to={`/products?category=${cat.slug}`} key={idx} style={{ display: 'block', position: 'relative', transition: 'var(--transition-smooth)', width: '260px' }} className="category-card">
                <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', backgroundColor: '#EBE4D9', border: '1px solid var(--color-border-light)' }}>
                  <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }} className="cat-img" />
                </div>
                {/* Overlapping Parchment Title Box */}
                <div style={{ position: 'absolute', bottom: '-15px', left: '10px', right: '10px', backgroundColor: 'var(--bg-light)', border: '1px solid var(--color-border-light)', padding: '0.75rem 0.5rem', textAlign: 'center', zIndex: 5 }} className="cat-title-box">
                  <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Architectural Spotlight Banner - Luxury Project Overlay */}
      <section style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', borderTop: '1px solid var(--color-border-dark)', borderBottom: '1px solid var(--color-border-dark)', padding: '8rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '5rem', alignItems: 'center' }} className="spotlight-layout">
            
            {/* Left Image Column */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <Link to={`/products/${spotlightProducts[spotlightIdx].slug}`} style={{ width: '100%', display: 'block' }}>
                <img 
                  src={spotlightProducts[spotlightIdx].image} 
                  alt={spotlightProducts[spotlightIdx].title} 
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', backgroundColor: '#ffffff', border: '1px solid var(--color-border-dark)' }}
                />
              </Link>
              <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', backgroundColor: 'rgba(17,17,17,0.85)', padding: '0.5rem 1rem', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                Project Spotlight
              </div>
            </div>

            {/* Right Typography Column */}
            <div>
              <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', display: 'block', marginBottom: '1rem' }}>Architectural Case Study</span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.6rem', color: 'var(--text-on-dark)', fontWeight: 400, marginBottom: '1.5rem', lineHeight: 1.15 }}>
                {spotlightProducts[spotlightIdx].title}
              </h2>
              <p style={{ color: 'var(--text-muted-on-dark)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                {spotlightProducts[spotlightIdx].text}
              </p>
              
              {/* Highlight callouts */}
              <div style={{ borderTop: '1px solid var(--color-border-dark)', paddingTop: '1.5rem', display: 'flex', gap: '3rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-accent)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Material Specification</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-on-dark)' }}>{spotlightProducts[spotlightIdx].name}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-accent)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Core Attributes</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-on-dark)' }}>{spotlightProducts[spotlightIdx].attributes}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Products - Off-White with Cross-fading Cards */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5rem' }}>
            <div>
              <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em' }}>Best Sellers</span>
              <h2 style={{ fontSize: '2.8rem', marginTop: '0.75rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Featured Products</h2>
            </div>
            <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-accent)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.25rem', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }} className="nav-hover-gold">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="product-grid">
            {featuredProducts.map((prod) => (
              <div key={prod.id} className={`product-card ${prod.category === 'Bricks' ? 'no-hover-swap' : ''}`}>
                <Link to={`/products/${prod.slug}`}>
                  <div className="product-image-wrapper">
                    <img src={prod.images[0]} alt={prod.name} className="product-image-primary" />
                    {prod.category !== 'Bricks' && (
                      <img src={prod.images[1] || prod.images[0]} alt={prod.name} className="product-image-secondary" />
                    )}
                    <span className="badge badge-featured">Featured Selection</span>
                  </div>
                </Link>
                <div className="product-info">
                  <span className="product-cat">{prod.category}</span>
                  <Link to={`/products/${prod.slug}`}>
                    <h3 className="product-title" style={{ minHeight: '3.2rem' }}>{prod.name}</h3>
                  </Link>
                  <div className="product-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill={i < Math.floor(prod.stars) ? 'currentColor' : 'none'} style={{ strokeWidth: 1.5 }} />
                    ))}
                    <span style={{ color: 'var(--text-muted-on-light)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>{prod.stars}</span>
                  </div>
                  <div className="product-price">
                    £{prod.price.toFixed(2)} <span style={{ color: 'var(--text-muted-on-light)' }}>ex. VAT</span>
                  </div>
                  <button
                    onClick={() => addToCart(prod, prod.size, 1, prod.price)}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.75rem', letterSpacing: '0.1em' }}
                  >
                    Add to Basket
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Editorial Quotation Banner (Tactile Luxury Brand feel) */}
      <section style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', padding: '9rem 0', textAlign: 'center', borderTop: '1px solid var(--color-border-dark)', borderBottom: '1px solid var(--color-border-dark)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', display: 'block', marginBottom: '2rem' }}>Material Heritage</span>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', lineHeight: 1.6, fontStyle: 'italic', fontWeight: 300, color: 'var(--text-on-dark)' }}>
            “Stone does not belong to the yard; it belongs to the landscape. We source natural sandstone and vitrified porcelain that possess a raw, enduring geology—crafted by nature to weather gracefully for generations.”
          </p>
          <div style={{ width: '60px', height: '1px', backgroundColor: 'var(--color-accent)', margin: '2.5rem auto 1.5rem auto' }}></div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>JMD Global Stones</p>
        </div>
      </section>

      {/* Customer Reviews Carousel - Deep Charcoal */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)' }}>
        <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
          <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em' }}>Client Testimonials</span>
          <h2 style={{ fontSize: '2.8rem', marginTop: '0.75rem', marginBottom: '4rem', fontFamily: 'var(--font-heading)', color: 'var(--text-on-dark)', fontWeight: 400 }}>What Our Clients Say</h2>
          
          <div style={{ minHeight: '160px', transition: 'var(--transition-smooth)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', color: 'var(--color-accent)', marginBottom: '2rem' }}>
              {[...Array(reviews[activeReviewIdx].rating)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" style={{ strokeWidth: 1 }} />
              ))}
            </div>
            <p style={{ fontSize: '1.8rem', fontStyle: 'italic', fontFamily: 'var(--font-heading)', color: 'var(--text-on-dark)', marginBottom: '2rem', lineHeight: 1.6, fontWeight: 300 }}>
              “{reviews[activeReviewIdx].comment}”
            </p>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-accent)', fontWeight: 600 }}>
              {reviews[activeReviewIdx].name}
            </h4>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '3rem' }}>
            {reviews.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveReviewIdx(idx)} 
                style={{ width: '6px', height: '6px', backgroundColor: idx === activeReviewIdx ? 'var(--color-accent)' : 'var(--color-border-dark)', cursor: 'pointer', transition: 'var(--transition-smooth)', border: 'none' }}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup - Deep Charcoal */}
      <section style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', padding: '7rem 0', textAlign: 'center', borderTop: '1px solid var(--color-border-dark)' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 style={{ color: 'var(--text-on-dark)', fontSize: '2.8rem', fontFamily: 'var(--font-heading)', marginBottom: '1.25rem', fontWeight: 400 }}>Join the Trade Registry</h2>
          <p style={{ color: 'var(--text-muted-on-dark)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Subscribe to receive regular quarry updates, container arrival notifications, and commercial stock lists directly to your inbox.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }} style={{ display: 'flex', gap: '0', border: '1px solid var(--color-border-dark)' }}>
            <input 
              type="email" 
              required 
              placeholder="Your email address" 
              style={{ flexGrow: 1, padding: '1.25rem', backgroundColor: '#1A1A1A', color: '#FFFFFF', borderRight: '1px solid var(--color-border-dark)' }} 
            />
            <button type="submit" className="btn btn-accent" style={{ whiteSpace: 'nowrap', border: 'none', padding: '0 2.5rem' }}>Subscribe</button>
          </form>
        </div>
      </section>

      {/* Before & After Gallery Section */}
      <section style={{ backgroundColor: 'var(--bg-dark)', padding: '6rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>
              <span style={{ width: '2rem', height: '1px', backgroundColor: 'var(--color-accent)', display: 'inline-block' }} />
              <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em' }}>Installations</span>
              <span style={{ width: '2rem', height: '1px', backgroundColor: 'var(--color-accent)', display: 'inline-block' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', fontWeight: 400, color: 'var(--text-on-dark)', lineHeight: 1.2, marginBottom: '1rem' }}>
              Real Transformations
            </h2>
            <p style={{ color: 'var(--text-muted-on-dark)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              See the difference premium stone makes. Customer installations across the UK.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="gallery-grid">

            {/* Main before/after card */}
            <div style={{ position: 'relative', overflow: 'hidden', gridRow: 'span 1' }}>
              <img
                src="/gallery-before-after.png"
                alt="Garden patio transformation — before and after Indian Sandstone installation"
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '480px', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', padding: '0.4rem 1rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                Before → After
              </div>
              <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}>
                <div style={{ backgroundColor: 'rgba(10,10,10,0.8)', padding: '1rem 1.25rem' }}>
                  <p style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.15rem' }}>Sandstone Patio — Wirral</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.73rem' }}>Raj Green Indian Sandstone, Mixed Size Patio Pack</p>
                </div>
              </div>
            </div>

            {/* Porcelain card */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                src="/gallery-porcelain.png"
                alt="Luxury anthracite porcelain paving installation — modern British garden"
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '480px', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'var(--color-accent)', color: '#000', padding: '0.4rem 1rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                Porcelain
              </div>
              <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}>
                <div style={{ backgroundColor: 'rgba(10,10,10,0.8)', padding: '1rem 1.25rem' }}>
                  <p style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.15rem' }}>County Anthracite — Southampton</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.73rem' }}>Large Format Porcelain, 900×600mm</p>
                </div>
              </div>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/products" className="btn" style={{ color: 'var(--text-on-dark)', borderColor: 'var(--color-border-dark)', padding: '0.85rem 2.5rem', fontSize: '0.8rem', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Shop All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Responsive Grid Layout Overrides style */}
      <style>{`
        .category-card:hover .cat-img { transform: scale(1.05) !important; }
        .category-card:hover .cat-title-box { border-color: var(--color-accent) !important; color: var(--color-accent) !important; }
        @media (max-width: 768px) {
          .hero-layout, .spotlight-layout { grid-template-columns: 1fr !important; gap: 3rem !important; }
          .trust-layout { grid-template-columns: repeat(2, 1fr) !important; gap: 2rem !important; }
          .trust-card-item { border-right: none !important; border-bottom: 1px solid var(--color-border-light); padding-bottom: 1.5rem !important; }
          .trust-card-item:nth-child(even) { border-right: none !important; }
          .trust-card-item:last-child { border-bottom: none !important; padding-bottom: 0 !important; }
          .gallery-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .trust-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  );
}
