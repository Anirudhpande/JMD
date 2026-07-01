import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, CheckSquare, MessageSquare, ArrowRight, Star, ChevronRight, Zap, Package } from 'lucide-react';
import { apiFetch } from '../api.js';
import useSEO from '../hooks/useSEO.js';

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

const CATEGORY_TABS = ['All', 'Sandstone', 'Porcelain', 'Bricks'];

export default function Home({ addToCart }) {
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    home_hero_headline: "Enduring Stone.",
    home_hero_subheadline: "Architectural Form.",
    home_hero_text: "Direct quarry importers supplying calibrated Indian Sandstone and Vitrified Porcelain flags — crafted to weather gracefully for generations.",
    trust_bar: [
      "£49 Flat Rate UK Delivery",
      "Direct Imported Best Quality",
      "Ready for Fast Dispatch",
      "Yard Managers on Call"
    ]
  });

  useSEO({
    title: 'Buy Paving Slabs UK | Indian Sandstone, Porcelain & Natural Stone',
    description: 'Shop premium Indian Sandstone, Porcelain and Natural Stone Paving. UK-wide delivery. Trade & retail prices. Family-run importer.',
    canonical: 'https://jmdglobalstones.co.uk/'
  });

  useEffect(() => {
    Promise.all([
      apiFetch('/api/products').then(res => { if (!res.ok) throw new Error(); return res.json(); }),
      apiFetch('/api/site-settings').then(res => { if (!res.ok) throw new Error(); return res.json(); })
    ])
      .then(([productsData, settingsData]) => {
        setAllProducts(productsData);
        if (settingsData && Object.keys(settingsData).length > 0) {
          setSettings(prev => ({ ...prev, ...settingsData }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Review Auto-Rotate
  useEffect(() => {
    const t = setInterval(() => setActiveReviewIdx(p => (p + 1) % reviews.length), 5000);
    return () => clearInterval(t);
  }, []);

  const filteredProducts = activeCategory === 'All'
    ? allProducts
    : allProducts.filter(p => p.category === activeCategory);

  const featuredProducts = allProducts.filter(p => p.is_featured).slice(0, 4);

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
    <div style={{ backgroundColor: 'var(--bg-light)' }}>

      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <section style={{
        backgroundColor: 'var(--bg-dark)',
        color: 'var(--text-on-dark)',
        padding: '6rem 0 5rem',
        borderBottom: '1px solid var(--color-border-dark)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* subtle background texture lines */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, #C9A96E 39px, #C9A96E 40px)',
          pointerEvents: 'none'
        }} />

        <div className="container hero-layout" style={{ display: 'grid', gap: '4rem', alignItems: 'center' }}>
          {/* Left */}
          <div>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)', display: 'block', marginBottom: '1.25rem' }}>
              Direct Quarry Importers · UK Stockists
            </span>
            <h1 style={{ fontSize: '4.5rem', color: 'var(--text-on-dark)', lineHeight: 1.0, fontFamily: 'var(--font-heading)', fontWeight: 400, marginBottom: '1.5rem' }} className="clip-reveal delay-1">
              {settings.home_hero_headline}<br />
              <span style={{ color: 'var(--color-accent)' }}>{settings.home_hero_subheadline}</span>
            </h1>
            <p style={{ color: 'var(--text-muted-on-dark)', fontSize: '1rem', marginBottom: '2.5rem', maxWidth: '480px', lineHeight: 1.7 }}>
              {settings.home_hero_text}
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="#shop-section" className="btn btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Shop Products <ArrowRight size={15} />
              </a>
              <Link to="/delivery" className="btn" style={{ borderColor: 'var(--color-border-dark)', color: 'var(--text-on-dark)' }}>
                Delivery Rates
              </Link>
            </div>

            {/* Quick stats row */}
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border-dark)' }}>
              {[
                { num: '16+', label: 'Stone Varieties' },
                { num: '2', label: 'UK Yards' },
                { num: '3–5', label: 'Day Dispatch' }
              ].map(s => (
                <div key={s.num}>
                  <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--color-accent)', fontWeight: 400 }}>{s.num}</div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted-on-dark)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero image with floating badge */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }} className="fade-in-up delay-2">
            <img
              src="/images/stone_patio_layout.png"
              alt="Luxury Sandstone installed patio garden terrace"
              style={{ width: '100%', height: '380px', objectFit: 'cover', border: '1px solid var(--color-border-dark)' }}
            />
            <div style={{ position: 'absolute', bottom: '-18px', right: '-10px', backgroundColor: 'var(--bg-dark)', padding: '1.1rem 1.5rem', border: '1px solid var(--color-accent)' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '0.2rem' }}>Architectural Finish</p>
              <p style={{ fontWeight: 400, fontSize: '1.1rem', fontFamily: 'var(--font-heading)', color: 'var(--text-on-dark)' }}>Calibrated Indian Sandstone</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--color-border-light)', padding: '2.25rem 0', backgroundColor: 'var(--bg-light)' }}>
        <div className="container trust-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0 1rem' }} className="trust-card-item border-r">
            <Truck size={20} style={{ color: 'var(--color-accent)' }} />
            <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Flat Rate Delivery</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted-on-light)' }}>{settings.trust_bar?.[0]}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0 1rem' }} className="trust-card-item border-r">
            <ShieldCheck size={20} style={{ color: 'var(--color-accent)' }} />
            <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>100% Genuine Stone</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted-on-light)' }}>{settings.trust_bar?.[1]}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0 1rem' }} className="trust-card-item border-r">
            <Zap size={20} style={{ color: 'var(--color-accent)' }} />
            <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>UK Yard Stock</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted-on-light)' }}>{settings.trust_bar?.[2]}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0 1rem' }} className="trust-card-item">
            <MessageSquare size={20} style={{ color: 'var(--color-accent)' }} />
            <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Expert Guidance</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted-on-light)' }}>{settings.trust_bar?.[3]}</p>
          </div>
        </div>
      </section>

      {/* ── MAIN PRODUCT SHOP ───────────────────────────────── */}
      <section id="shop-section" style={{ backgroundColor: 'var(--bg-light)', padding: '6rem 0' }}>
        <div className="container">

          {/* Section header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em' }}>Browse the Collection</span>
              <h2 style={{ fontSize: '2.6rem', marginTop: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Our Products</h2>
            </div>
            <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--color-accent)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.2rem', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '3rem', borderBottom: '1px solid var(--color-border-light)' }}>
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                style={{
                  padding: '0.85rem 1.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  color: activeCategory === tab ? 'var(--text-on-light)' : 'var(--text-muted-on-light)',
                  borderBottom: activeCategory === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
                  marginBottom: '-1px',
                  transition: 'all 0.25s ease'
                }}
              >
                {tab}
                {tab !== 'All' && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted-on-light)' }}>
                    ({allProducts.filter(p => p.category === tab).length})
                  </span>
                )}
                {tab === 'All' && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted-on-light)' }}>
                    ({allProducts.length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-muted-on-light)' }}>
              <Package size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No products in this category yet.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className={`product-card ${prod.category === 'Bricks' ? 'no-hover-swap' : ''}`}>
                  <Link to={`/products/${prod.slug}`}>
                    <div className="product-image-wrapper">
                      <img src={prod.images[0]} alt={prod.name} className="product-image-primary" />
                      {prod.category !== 'Bricks' && (
                        <img src={prod.images[1] || prod.images[0]} alt={prod.name} className="product-image-secondary" />
                      )}
                      {prod.is_featured && (
                        <span className="badge badge-featured">Best Seller</span>
                      )}
                      {(prod.stock || 0) > 0 && (
                        <span style={{
                          position: 'absolute', bottom: '0.75rem', left: '0.75rem',
                          backgroundColor: 'rgba(17,17,17,0.85)', color: '#5F9E75',
                          fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.08em', padding: '0.3rem 0.6rem'
                        }}>
                          In Stock
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="product-info">
                    <span className="product-cat">{prod.category}</span>
                    <Link to={`/products/${prod.slug}`}>
                      <h3 className="product-title" style={{ minHeight: '3.2rem' }}>{prod.name}</h3>
                    </Link>
                    <div className="product-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < Math.floor(prod.stars) ? 'currentColor' : 'none'} style={{ strokeWidth: 1.5 }} />
                      ))}
                      <span style={{ color: 'var(--text-muted-on-light)', fontSize: '0.72rem', marginLeft: '0.25rem' }}>{prod.stars}</span>
                    </div>
                    <div className="product-price">
                      £{prod.price.toFixed(2)} <span style={{ color: 'var(--text-muted-on-light)' }}>ex. VAT</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
                      <button
                        onClick={() => addToCart(prod, prod.size, 1, prod.price)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}
                      >
                        Add to Basket
                      </button>
                      <Link
                        to={`/products/${prod.slug}`}
                        className="btn"
                        style={{ border: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.75rem' }}
                        title="View Details"
                      >
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show more CTA */}
          {filteredProducts.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <Link to={`/products${activeCategory !== 'All' ? `?category=${activeCategory.toLowerCase()}` : ''}`} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                See Full Catalogue <ArrowRight size={14} style={{ display: 'inline', marginLeft: '0.4rem' }} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── WHY JMD — Three value pillars ───────────────────── */}
      <section style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', padding: '7rem 0', borderTop: '1px solid var(--color-border-dark)', borderBottom: '1px solid var(--color-border-dark)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em' }}>Why Choose Us</span>
            <h2 style={{ fontSize: '2.6rem', marginTop: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400, color: 'var(--text-on-dark)' }}>Direct from Quarry to You</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }} className="pillars-grid">
            {[
              {
                num: '01',
                title: 'Source Direct',
                text: 'We own our sourcing chain — directly importing from quarries across India. No middlemen, no markups, just authentic stone at fair trade prices.'
              },
              {
                num: '02',
                title: 'Calibrated Quality',
                text: 'Every paving slab is calibrated and QC-checked before leaving our Wirral and Southampton yards. Consistent thickness means easier, faster installation.'
              },
              {
                num: '03',
                title: 'Expert Support',
                text: 'Our yard managers are reachable by phone and WhatsApp. We guide you on laying patterns, coverage calculations and proper sealing aftercare.'
              }
            ].map(p => (
              <div key={p.num} style={{ borderTop: '1px solid var(--color-border-dark)', paddingTop: '2rem' }}>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--color-accent)', fontWeight: 700, marginBottom: '1rem' }}>{p.num}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--text-on-dark)', fontWeight: 400, marginBottom: '1rem' }}>{p.title}</h3>
                <p style={{ color: 'var(--text-muted-on-dark)', fontSize: '0.9rem', lineHeight: 1.7 }}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY STRIP ───────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--bg-dark)', padding: '0 0 6rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="gallery-grid">
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                src="/gallery-before-after.png"
                alt="Garden patio transformation — Indian Sandstone"
                loading="lazy"
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff', padding: '0.4rem 1rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Before → After</div>
              <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}>
                <div style={{ backgroundColor: 'rgba(10,10,10,0.82)', padding: '0.9rem 1.1rem' }}>
                  <p style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.15rem' }}>Sandstone Patio — Wirral</p>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem' }}>Raj Green Indian Sandstone, Mixed Size Patio Pack</p>
                </div>
              </div>
            </div>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                src="/gallery-porcelain.png"
                alt="Luxury anthracite porcelain paving — modern garden"
                loading="lazy"
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'var(--color-accent)', color: '#000', padding: '0.4rem 1rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Porcelain</div>
              <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}>
                <div style={{ backgroundColor: 'rgba(10,10,10,0.82)', padding: '0.9rem 1.1rem' }}>
                  <p style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.15rem' }}>County Anthracite — Southampton</p>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem' }}>Large Format Porcelain, 900×600mm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS ────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--bg-light)', padding: '7rem 0', borderTop: '1px solid var(--color-border-light)' }}>
        <div className="container" style={{ maxWidth: '760px', textAlign: 'center' }}>
          <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em' }}>Client Testimonials</span>
          <h2 style={{ fontSize: '2.4rem', marginTop: '0.5rem', marginBottom: '3.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>What Our Clients Say</h2>

          <div style={{ minHeight: '160px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem', color: 'var(--color-accent)', marginBottom: '1.5rem' }}>
              {[...Array(reviews[activeReviewIdx].rating)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" style={{ strokeWidth: 1 }} />
              ))}
            </div>
            <p style={{ fontSize: '1.6rem', fontStyle: 'italic', fontFamily: 'var(--font-heading)', color: 'var(--text-on-light)', marginBottom: '1.75rem', lineHeight: 1.6, fontWeight: 300 }}>
              "{reviews[activeReviewIdx].comment}"
            </p>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-accent)', fontWeight: 600 }}>
              {reviews[activeReviewIdx].name}
            </h4>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '2.5rem' }}>
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveReviewIdx(idx)}
                style={{ width: '6px', height: '6px', backgroundColor: idx === activeReviewIdx ? 'var(--color-accent)' : 'var(--color-border-light)', cursor: 'pointer', transition: 'all 0.3s', border: 'none' }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ──────────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', padding: '6rem 0', textAlign: 'center', borderTop: '1px solid var(--color-border-dark)' }}>
        <div className="container" style={{ maxWidth: '560px' }}>
          <h2 style={{ color: 'var(--text-on-dark)', fontSize: '2.4rem', fontFamily: 'var(--font-heading)', marginBottom: '1rem', fontWeight: 400 }}>Join the Trade Registry</h2>
          <p style={{ color: 'var(--text-muted-on-dark)', fontSize: '0.95rem', marginBottom: '2.25rem', lineHeight: 1.6 }}>
            Receive quarry updates, container arrival notifications and commercial stock lists.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }} style={{ display: 'flex', border: '1px solid var(--color-border-dark)' }}>
            <input
              type="email"
              required
              placeholder="Your email address"
              style={{ flexGrow: 1, padding: '1.1rem 1.25rem', backgroundColor: '#1A1A1A', color: '#FFFFFF', borderRight: '1px solid var(--color-border-dark)' }}
            />
            <button type="submit" className="btn btn-accent" style={{ whiteSpace: 'nowrap', border: 'none', padding: '0 2rem' }}>Subscribe</button>
          </form>
        </div>
      </section>

      {/* ── RESPONSIVE STYLES ───────────────────────────────── */}
      <style>{`
        .hero-layout { grid-template-columns: 1.1fr 0.9fr; }
        .category-card:hover .cat-img { transform: scale(1.05) !important; }
        .category-card:hover .cat-title-box { border-color: var(--color-accent) !important; color: var(--color-accent) !important; }
        @media (max-width: 900px) {
          .hero-layout { grid-template-columns: 1fr !important; }
          .pillars-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .gallery-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .trust-layout { grid-template-columns: repeat(2, 1fr) !important; gap: 2rem !important; }
          .trust-card-item { border-right: none !important; border-bottom: 1px solid var(--color-border-light); padding-bottom: 1.5rem !important; }
          .trust-card-item:last-child { border-bottom: none !important; }
        }
        @media (max-width: 480px) {
          .trust-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
