import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Star, ArrowRight, ArrowLeft, ChevronRight, Package, Zap, Award, MessageSquare } from 'lucide-react';
import { apiFetch } from '../api.js';
import useSEO from '../hooks/useSEO.js';

const CATEGORY_TABS = [
  { label: 'All',       slug: null,        img: '/images/raj-green-sandstone.png' },
  { label: 'Sandstone', slug: 'sandstone', img: '/images/raj-green-sandstone.png' },
  { label: 'Porcelain', slug: 'porcelain', img: '/images/county-anthracite.png'   },
  { label: 'Bricks',    slug: 'bricks',    img: '/images/half-round-bricks.png'   },
];

// Hero slides — one per featured product concept
const HERO_SLIDES = [
  {
    tag:      'Best Seller',
    headline: 'Raj Green Indian\nSandstone',
    sub:      'Natural riven surface. 22mm calibrated thickness. Timeless garden character.',
    price:    '£278.00',
    img:      '/images/raj-green-sandstone.png',
    slug:     'raj-green-indian-sandstone-paving-slabs-project-pack-18-9m2',
    accent:   '#3D5A47',
    bg:       'linear-gradient(135deg, #EAE6DC 0%, #D9D3C3 100%)',
  },
  {
    tag:      'Premium Porcelain',
    headline: 'County Anthracite\nPorcelain',
    sub:      'Vitrified R11 slip-rated. 900×600mm large format. Zero maintenance.',
    price:    '£292.00',
    img:      '/images/county-anthracite.png',
    slug:     'county-anthracite-porcelain-paving-slabs-900x600mm',
    accent:   '#4A5568',
    bg:       'linear-gradient(135deg, #E8EDF2 0%, #D0D8E2 100%)',
  },
  {
    tag:      'Warm Tones',
    headline: 'Rippon Buff\nSandstone',
    sub:      'Warm buff and honey tones. Natural Indian sandstone. Riven surface finish.',
    price:    '£279.00',
    img:      '/images/rippon-buff-sandstone.png',
    slug:     'rippon-buff-indian-sandstone-paving-slabs-project-pack-18-9m2',
    accent:   '#8B6914',
    bg:       'linear-gradient(135deg, #F5EDD8 0%, #E8D9B8 100%)',
  },
];

const reviews = [
  { name: 'David L. — Wirral',       rating: 5, comment: 'Outstanding quality sandstone. Delivered exactly when requested.' },
  { name: 'Sarah M. — Southampton',  rating: 5, comment: 'Extremely premium look! The porcelain is perfect on our patio.' },
  { name: 'James K. — Chester',      rating: 5, comment: 'Great customer service from Roopesh. Consistent thickness.' },
];

export default function Home({ addToCart }) {
  const [allProducts, setAllProducts]       = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [heroIdx, setHeroIdx]               = useState(0);
  const [reviewIdx, setReviewIdx]           = useState(0);
  const [loading, setLoading]               = useState(true);
  
  const heroTimer = useRef(null);
  const productCarouselRef = useRef(null);
  const isCarouselHovered = useRef(false);

  useSEO({
    title:       'Buy Paving Slabs UK | Indian Sandstone, Porcelain & Natural Stone | JMD Global Stones',
    description: 'Shop premium Indian Sandstone, Porcelain and Natural Stone Paving direct from importers. UK-wide delivery. Trade & retail prices.',
    canonical:   'https://jmdglobalstones.co.uk/',
  });

  useEffect(() => {
    Promise.all([
      apiFetch('/api/products').then(r => r.json()),
    ]).then(([products]) => {
      setAllProducts(products);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Hero auto-slide
  useEffect(() => {
    heroTimer.current = setInterval(() => setHeroIdx(p => (p + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(heroTimer.current);
  }, []);

  const goHero = (dir) => {
    clearInterval(heroTimer.current);
    setHeroIdx(p => (p + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
    heroTimer.current = setInterval(() => setHeroIdx(p => (p + 1) % HERO_SLIDES.length), 5000);
  };

  // Review auto-rotate
  useEffect(() => {
    const t = setInterval(() => setReviewIdx(p => (p + 1) % reviews.length), 4500);
    return () => clearInterval(t);
  }, []);

  // Product Carousel Auto-Scroll Effect
  useEffect(() => {
    if (loading || allProducts.length === 0) return;

    const scrollInterval = setInterval(() => {
      const el = productCarouselRef.current;
      if (!el || isCarouselHovered.current) return;

      const cardWidth = 320 + 20; // card width + gap
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft >= maxScroll - 5) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, [loading, allProducts, activeCategory]);

  const scrollCarouselManual = (direction) => {
    const el = productCarouselRef.current;
    if (!el) return;
    const cardWidth = 320 + 20;
    el.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  };

  const filteredProducts = activeCategory
    ? allProducts.filter(p => p.category.toLowerCase() === activeCategory)
    : allProducts;

  const slide = HERO_SLIDES[heroIdx];

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-light)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>JMD Global Stones</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted-on-light)', letterSpacing: '0.05em' }}>Loading premium materials…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-light)' }}>

      {/* ════════════════════════════════════════════════════════
          HERO BANNER — Large product image, left text, right img
      ═══════════════════════════════════════════════════════ */}
      <section style={{ background: slide.bg, transition: 'background 0.8s ease', overflow: 'hidden', position: 'relative' }}>

        <div className="container hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '500px', alignItems: 'center', gap: '2rem', padding: '4rem 2.5rem' }}>

          {/* LEFT — text */}
          <div style={{ zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(0,0,0,0.08)', padding: '0.3rem 0.85rem', marginBottom: '1.5rem' }}>
              <Zap size={11} style={{ color: slide.accent }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: slide.accent }}>{slide.tag}</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.6rem', lineHeight: 1.05, fontWeight: 400, color: '#111', marginBottom: '1.25rem', whiteSpace: 'pre-line' }}>
              {slide.headline}
            </h1>

            <p style={{ fontSize: '0.92rem', color: '#444', lineHeight: 1.65, marginBottom: '2rem', maxWidth: '400px' }}>
              {slide.sub}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: '0.15rem' }}>From</div>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 400, color: '#111' }}>{slide.price}</div>
                <div style={{ fontSize: '0.65rem', color: '#888' }}>ex. VAT / pack</div>
              </div>
              <div style={{ display: 'flex', gap: '0.1rem', color: '#C9A96E' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" style={{ strokeWidth: 1 }} />)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link
                to={`/products/${slide.slug}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#111', color: '#fff', padding: '0.9rem 2rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'background 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C9A96E'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#111'}
              >
                Shop Now <ArrowRight size={14} />
              </Link>
              <Link
                to="/products"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #ccc', color: '#333', padding: '0.9rem 1.75rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: 'rgba(255,255,255,0.5)' }}
              >
                All Products
              </Link>
            </div>
          </div>

          {/* RIGHT — big product image */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: '400px' }}>
            <img
              key={heroIdx}
              src={slide.img}
              alt={slide.headline}
              style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.18))', animation: 'heroFadeIn 0.6s ease forwards' }}
            />
          </div>
        </div>

        {/* Slide controls */}
        <button onClick={() => goHero(-1)} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.1)', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5 }}>
          <ArrowLeft size={16} />
        </button>
        <button onClick={() => goHero(1)} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.1)', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5 }}>
          <ArrowRight size={16} />
        </button>

        {/* Dot indicators */}
        <div style={{ position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => { clearInterval(heroTimer.current); setHeroIdx(i); }} style={{ width: i === heroIdx ? '24px' : '8px', height: '8px', backgroundColor: i === heroIdx ? '#111' : 'rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TRUST BAR
      ═══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', borderTop: '1px solid #E5E0D8', borderBottom: '1px solid #E5E0D8', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {[
            { icon: <Truck size={18} />,      label: 'UK Nationwide Delivery',   sub: 'Calculated by postcode' },
            { icon: <ShieldCheck size={18} />, label: '100% Genuine Stone',       sub: 'Direct quarry import'   },
            { icon: <Zap size={18} />,         label: '3–5 Day Dispatch',         sub: 'From UK yard stock'     },
            { icon: <Award size={18} />,       label: 'Expert Yard Support',      sub: 'Call or WhatsApp us'    },
          ].map(t => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: '#C9A96E' }}>{t.icon}</div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{t.label}</div>
                <div style={{ fontSize: '0.68rem', color: '#888' }}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          BROWSE BY CATEGORY — Large, premium category cards (200% size)
      ═══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--bg-light)', padding: '5rem 0 3rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C9A96E', fontWeight: 700 }}>Collections</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 400, marginTop: '0.5rem', color: '#111' }}>Browse by Category</h2>
          </div>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {CATEGORY_TABS.map(cat => {
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.slug)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                    padding: '2rem', cursor: 'pointer',
                    backgroundColor: isActive ? '#111' : '#fff',
                    border: isActive ? '1px solid #111' : '1px solid #E0D9CE',
                    transition: 'all 0.3s ease', 
                    width: '260px',
                    height: '290px',
                    position: 'relative'
                  }}
                  className="cat-large-card"
                >
                  <div style={{ width: '100%', height: '170px', overflow: 'hidden', backgroundColor: isActive ? '#222' : '#F5F0E8', border: '1px solid #ECE6DB' }}>
                    <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="cat-card-img" />
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isActive ? '#C9A96E' : '#111', display: 'block' }}>{cat.label}</span>
                    {cat.slug && (
                      <span style={{ fontSize: '0.7rem', color: isActive ? '#aaa' : '#777', marginTop: '0.2rem', display: 'block' }}>
                        {allProducts.filter(p => p.category.toLowerCase() === cat.slug).length} Products Available
                      </span>
                    )}
                    {!cat.slug && (
                      <span style={{ fontSize: '0.7rem', color: isActive ? '#aaa' : '#777', marginTop: '0.2rem', display: 'block' }}>
                        {allProducts.length} Products Available
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PRODUCT CAROUSEL — Single Row with Autoscroll & Controls
      ═══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--bg-light)', padding: '4rem 0 5rem' }}>
        <div className="container" style={{ position: 'relative' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C9A96E', fontWeight: 700 }}>Curated Paving</span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.3rem', fontWeight: 400, marginTop: '0.25rem', color: '#111' }}>Featured Materials</h2>
            </div>
            
            {/* Carousel navigation controls */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => scrollCarouselManual(-1)}
                style={{ width: '42px', height: '42px', border: '1px solid #D9D2C5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#fff', transition: 'all 0.25s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A96E'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#D9D2C5'}
              >
                <ArrowLeft size={16} />
              </button>
              <button 
                onClick={() => scrollCarouselManual(1)}
                style={{ width: '42px', height: '42px', border: '1px solid #D9D2C5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#fff', transition: 'all 0.25s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A96E'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#D9D2C5'}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Autoscrolling Row Wrapper */}
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: '#aaa', backgroundColor: '#fff', border: '1px solid #EDE7DC' }}>
              <Package size={36} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No products in this category yet.</p>
            </div>
          ) : (
            <div 
              ref={productCarouselRef}
              style={{ 
                display: 'flex', 
                gap: '20px', 
                overflowX: 'auto', 
                paddingBottom: '1rem',
                scrollBehavior: 'smooth'
              }}
              className="cat-scroll"
              onMouseEnter={() => isCarouselHovered.current = true}
              onMouseLeave={() => isCarouselHovered.current = false}
              onTouchStart={() => isCarouselHovered.current = true}
              onTouchEnd={() => isCarouselHovered.current = false}
            >
              {filteredProducts.map(prod => (
                <div
                  key={prod.id}
                  style={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #EDE7DC', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    transition: 'all 0.3s', 
                    position: 'relative',
                    width: '320px',
                    flexShrink: 0
                  }}
                  className="ecom-card"
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A96E'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#EDE7DC'}
                >
                  {/* Badge */}
                  {prod.is_featured && (
                    <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', backgroundColor: '#111', color: '#C9A96E', fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.25rem 0.6rem', zIndex: 2 }}>
                      Best Seller
                    </div>
                  )}
                  {(prod.stock || 0) > 0 && (
                    <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', backgroundColor: '#5F9E75', color: '#fff', fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.25rem 0.5rem', zIndex: 2 }}>
                      In Stock
                    </div>
                  )}

                  {/* Image */}
                  <Link to={`/products/${prod.slug}`} style={{ display: 'block', overflow: 'hidden', backgroundColor: '#F8F5EF', flexShrink: 0 }}>
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', padding: '1rem', transition: 'transform 0.5s ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </Link>

                  {/* Info */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
                    <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C9A96E', fontWeight: 700 }}>{prod.category}</span>
                    <Link to={`/products/${prod.slug}`}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111', lineHeight: 1.4, minHeight: '2.5rem' }}>{prod.name}</h3>
                    </Link>

                    {/* Stars */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} fill={i < Math.floor(prod.stars) ? '#C9A96E' : 'none'} stroke={i < Math.floor(prod.stars) ? '#C9A96E' : '#ccc'} style={{ strokeWidth: 1.5 }} />
                      ))}
                      <span style={{ fontSize: '0.65rem', color: '#999', marginLeft: '0.2rem' }}>{prod.stars}</span>
                    </div>

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', fontFamily: 'var(--font-heading)' }}>£{prod.price.toFixed(2)}</span>
                      <span style={{ fontSize: '0.65rem', color: '#999' }}>ex. VAT</span>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => addToCart(prod, prod.size, 1, prod.price)}
                        style={{ flexGrow: 1, backgroundColor: '#111', color: '#fff', padding: '0.75rem 0', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', border: '1px solid #111', transition: 'all 0.25s' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C9A96E'; e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.color = '#111'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#111'; e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.color = '#fff'; }}
                      >
                        Add to Basket
                      </button>
                      <Link
                        to={`/products/${prod.slug}`}
                        style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #D9D2C5', color: '#555', transition: 'all 0.25s', flexShrink: 0 }}
                        title="View Details"
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.color = '#C9A96E'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#D9D2C5'; e.currentTarget.style.color = '#555'; }}
                      >
                        <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          AESTHETICS BELOW PRODUCTS: case studies, transformations, quotations, reviews
      ═══════════════════════════════════════════════════════ */}

      {/* Aesthetic 1: Promotional Collection Banner */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', overflow: 'hidden', backgroundColor: '#1A1A1A', minHeight: '280px' }} className="promo-grid">
            {/* Left text */}
            <div style={{ padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C9A96E', fontWeight: 700, marginBottom: '0.75rem', display: 'block' }}>Quarry Direct Offer</span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: '#F5F0E8', fontWeight: 400, lineHeight: 1.15, marginBottom: '1rem' }}>
                Authentic Indian<br />Sandstone Collection
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#888', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '400px' }}>
                Sourced directly from our quarry partners in Rajasthan. Calibrated thickness. Riven surface. Ready from UK yard stock.
              </p>
              <Link
                to="/products?category=sandstone"
                style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#C9A96E', color: '#111', padding: '0.85rem 2rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'background 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#B8965B'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C9A96E'}
              >
                Explore Sandstone <ArrowRight size={13} />
              </Link>
            </div>
            {/* Right image */}
            <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }}>
              <img
                src="/images/autumn-brown-sandstone.png"
                alt="Indian Sandstone collection"
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2rem', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.4))' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Aesthetic 2: Before & After Garden Transformations */}
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
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                src="/gallery-before-after.png"
                alt="Garden patio transformation — before and after Indian Sandstone installation"
                loading="lazy"
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
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

            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                src="/gallery-porcelain.png"
                alt="Luxury anthracite porcelain paving installation — modern British garden"
                loading="lazy"
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
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
        </div>
      </section>

      {/* Aesthetic 3: Tactile Brand Heritage Quotation */}
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

      {/* Aesthetic 4: Client Testimonials Carousel */}
      <section style={{ backgroundColor: '#fff', borderTop: '1px solid #E5E0D8', borderBottom: '1px solid #E5E0D8', padding: '5rem 0' }}>
        <div className="container" style={{ maxWidth: '720px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C9A96E', fontWeight: 700 }}>Client Testimonials</span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 400, marginTop: '0.4rem', marginBottom: '3rem', color: '#111' }}>What Our Clients Say</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem', color: '#C9A96E', marginBottom: '1.25rem' }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" style={{ strokeWidth: 1 }} />)}
          </div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 300, color: '#222', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            "{reviews[reviewIdx].comment}"
          </p>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C9A96E', fontWeight: 700 }}>{reviews[reviewIdx].name}</span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setReviewIdx(i)} style={{ width: i === reviewIdx ? '22px' : '7px', height: '7px', backgroundColor: i === reviewIdx ? '#111' : '#D9D2C5', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* Aesthetic 5: Newsletter Sign up */}
      <section style={{ backgroundColor: '#111', color: '#F5F0E8', padding: '5rem 0', textAlign: 'center', borderTop: '1px solid #2C2C2C' }}>
        <div className="container" style={{ maxWidth: '520px' }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C9A96E', fontWeight: 700 }}>Trade Registry</span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 400, margin: '0.5rem 0 0.9rem', color: '#F5F0E8' }}>Get Stock Updates</h2>
          <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '2rem', lineHeight: 1.6 }}>Container arrivals, new varieties and commercial pricing direct to your inbox.</p>
          <form onSubmit={e => { e.preventDefault(); alert('Thank you for subscribing!'); }} style={{ display: 'flex', border: '1px solid #333' }}>
            <input type="email" required placeholder="Your email address" style={{ flexGrow: 1, padding: '1rem 1.25rem', backgroundColor: '#1A1A1A', color: '#fff', borderRight: '1px solid #333', fontSize: '0.85rem' }} />
            <button type="submit" style={{ whiteSpace: 'nowrap', border: 'none', padding: '0 1.75rem', backgroundColor: '#C9A96E', color: '#111', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}>Subscribe</button>
          </form>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          RESPONSIVE CSS
      ═══════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-grid { grid-template-columns: 1fr 1fr; }
        .promo-grid { grid-template-columns: 1.1fr 0.9fr; }
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        
        .cat-large-card:hover {
          border-color: var(--color-accent) !important;
          transform: translateY(-4px);
        }
        .cat-large-card:hover .cat-card-img {
          transform: scale(1.04);
        }
        
        @media (max-width: 900px) {
          .hero-grid  { grid-template-columns: 1fr !important; min-height: auto !important; }
          .promo-grid { grid-template-columns: 1fr !important; }
          .gallery-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
