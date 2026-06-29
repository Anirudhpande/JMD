import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';
import useSEO from '../hooks/useSEO.js';

const blogPosts = [
  {
    title: "How to Lay Indian Sandstone: A Step-by-Step Guide",
    slug: "how-to-lay-indian-sandstone",
    excerpt: "Learn how to prepare the ground, apply polymer slurry priming, lay a wet mortar bed, and seal your calibrated natural paving slabs successfully.",
    date: "June 28, 2026",
    author: "Roopesh Pande",
    category: "Laying Advice",
    image: "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/AB-Sandstone.png"
  },
  {
    title: "Porcelain vs. Sandstone Paving: Which is Best for Your Garden?",
    slug: "porcelain-vs-sandstone-paving",
    excerpt: "An in-depth comparison of vitrified porcelain paving tiles and natural Indian sandstone. We evaluate durability, maintenance, slip resistance, and cost.",
    date: "May 15, 2026",
    author: "Roopesh Pande",
    category: "Buying Guides",
    image: "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/County-Grey.png"
  },
  {
    title: "The Ultimate Guide to Sealing Natural Stone Slabs",
    slug: "ultimate-guide-to-sealing-natural-stone",
    excerpt: "Should you seal your sandstone, limestone, or slate? Discover the best sealing products, correct application times, and how to avoid moisture stains.",
    date: "April 02, 2026",
    author: "Yard Operations",
    category: "Care & Maintenance",
    image: "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/Kandla-Grey.png"
  },
  {
    title: "5 Modern Garden Designs Using Grey Anthracite Porcelain",
    slug: "modern-garden-designs-grey-porcelain",
    excerpt: "Be inspired by stunning contemporary garden patio designs featuring large-format dark porcelain tiles, minimalist furniture, and architectural lighting.",
    date: "March 18, 2026",
    author: "Design Team",
    category: "Inspiration",
    image: "/gallery-porcelain.png"
  }
];

export default function Blog() {
  useSEO({
    title: 'Stone Paving Blog | Laying Advice, Inspiration & Guides',
    description: 'Expert guides on laying Indian Sandstone, maintaining porcelain paving, choosing garden patio designs, and styling natural stone from JMD Global Stones.',
    canonical: 'https://jmdglobalstones.co.uk/blog'
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '8rem 0', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>
            <BookOpen size={16} />
            <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em' }}>JMD Knowledge Base</span>
          </div>
          <h1 style={{ fontSize: '3.6rem', fontFamily: 'var(--font-heading)', marginTop: '0.75rem', marginBottom: '1.5rem', fontWeight: 400, lineHeight: 1.1 }}>
            Insights, Guides & Inspiration
          </h1>
          <p style={{ color: 'var(--text-muted-on-light)', fontSize: '1.15rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.7 }}>
            Read professional laying advice, material comparisons, and outdoor styling tips curated by our yard managers.
          </p>
        </div>

        {/* Blog Post Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2.5rem' }} className="blog-grid">
          {blogPosts.map((post, idx) => (
            <article key={idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '280px', overflow: 'hidden', position: 'relative' }}>
                <img 
                  src={post.image} 
                  alt={post.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  loading="lazy"
                />
                <span style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', padding: '0.35rem 0.85rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {post.category}
                </span>
              </div>
              <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                
                {/* Meta */}
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted-on-light)', marginBottom: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={12} /> {post.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <User size={12} /> {post.author}
                  </span>
                </div>

                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 400, lineHeight: 1.25, marginBottom: '1rem' }}>
                  {post.title}
                </h2>

                <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem', flexGrow: 1 }}>
                  {post.excerpt}
                </p>

                <div>
                  <Link 
                    to={`/care`} 
                    className="btn btn-secondary" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', padding: '0.75rem 1.5rem', letterSpacing: '0.05em' }}
                  >
                    Read Guide <ArrowRight size={14} />
                  </Link>
                </div>

              </div>
            </article>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .blog-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </div>
  );
}
