import React, { useState } from 'react';
import { BookOpen, Calendar, User, ArrowRight, X, Clock, Tag, ChevronRight } from 'lucide-react';
import useSEO from '../hooks/useSEO.js';

const blogPosts = [
  {
    title: "How to Lay Indian Sandstone: A Step-by-Step Guide",
    slug: "how-to-lay-indian-sandstone",
    excerpt: "Learn how to prepare the ground, apply polymer slurry priming, lay a wet mortar bed, and seal your calibrated natural paving slabs successfully.",
    date: "June 28, 2026",
    author: "Roopesh Pande",
    category: "Laying Advice",
    readTime: "8 min read",
    image: "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/AB-Sandstone.png",
    content: (
      <div>
        <h3>Introduction</h3>
        <p>Indian Sandstone is one of the most popular natural stone paving choices in the UK, prized for its unique organic color variation and textured, riven surface. However, to ensure your patio doesn't shift, sink, or suffer from moisture staining, correct laying technique is essential. This guide outlines the professional method for laying JMD calibrated 22mm sandstone slabs.</p>
        
        <h3>1. Ground Preparation & Sub-Base</h3>
        <p>A solid patio starts with what's underneath it. Excavate the area to a depth of roughly 150mm. Remember to build in a slight fall (about 1:80 slope) running away from the house to direct surface rainwater runoff.</p>
        <p>Lay down at least 100mm of MOT Type 1 sub-base material. Compact this thoroughly using a vibrating plate compactor (wacker plate) in two separate layers of 50mm. The finished sub-base should be perfectly flat and echo the slope of your drainage fall.</p>
        
        <h3>2. The Crucial Step: SBR Slurry Priming</h3>
        <p style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '1rem', fontStyle: 'italic' }}>
          <strong>Important Warning:</strong> Natural sandstone is porous. If you place it directly on a wet mortar bed, the stone will suck up the moisture and cement minerals from below, leading to dark, permanent circle stains on your paving surface (efflorescence).
        </p>
        <p>To prevent this, apply a polymer-modified cementitious slurry primer (SBR) to the clean back of every slab immediately before laying it. Brush or roll the wet slurry primer over the entire underside of the slab. This forms an impermeable chemical bond between the stone and the mortar bed.</p>
        
        <h3>3. Mixing the Mortar Bed</h3>
        <p>Use a semi-wet mortar mix consisting of 4 parts sharp sand to 1 part Portland cement. Avoid "dot-and-dab" mortar techniques. Slabs must be laid on a full, continuous bed of mortar roughly 40-50mm thick. Dot-and-dab leaving voids under the stone will lead to loose tiles, pooling water, and slab cracks.</p>
        
        <h3>4. Laying the Sandstone</h3>
        <p>Lower the primed slab onto the mortar bed. Use a heavy rubber mallet to tap it down gently to the correct level and line. Always check your work with a spirit level. Work outward from your starting edge, leaving a consistent joint gap of 8–10mm between slabs.</p>
        
        <h3>5. Jointing & Sealing</h3>
        <p>Let the mortar set undisturbed for 24–48 hours. Once dry, fill the joints. For a fast and clean finish, use a brush-in polymeric jointing sand, or fill with a standard sand/cement mortar mix using a pointing trowel.</p>
        <p>We recommend waiting 8–12 weeks before applying a high-quality breathable impregnating sealer. This allows any natural efflorescence (salts) to exit the stone before sealing.</p>
      </div>
    )
  },
  {
    title: "Porcelain vs. Sandstone Paving: Which is Best for Your Garden?",
    slug: "porcelain-vs-sandstone-paving",
    excerpt: "An in-depth comparison of vitrified porcelain paving tiles and natural Indian sandstone. We evaluate durability, maintenance, slip resistance, and cost.",
    date: "May 15, 2026",
    author: "Roopesh Pande",
    category: "Buying Guides",
    readTime: "6 min read",
    image: "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/CA-Porc-Tiles-300x300.png",
    content: (
      <div>
        <h3>A Head-to-Head Material Review</h3>
        <p>When planning a garden transformation, the choice between natural Indian Sandstone and vitrified Porcelain is one of the most critical decisions you will make. Both materials look stunning, but they perform very differently under daily use. Here is how they compare across key categories:</p>
        
        <h3>1. Aesthetic & Style</h3>
        <ul>
          <li><strong>Indian Sandstone:</strong> Uniquely organic. No two slabs are identical. Each contains natural veins, mineral tones, and a riven textured surface that ages and weathers beautifully in rustic or traditional settings.</li>
          <li><strong>Porcelain:</strong> Modern and clean. Vitrified porcelain tiles offer highly consistent colors, straight sawn edges, and a flat, contemporary profile. It is ideal for modern landscaping schemes.</li>
        </ul>
        
        <h3>2. Maintenance & Durability</h3>
        <ul>
          <li><strong>Indian Sandstone:</strong> Higher maintenance. Being natural stone, it absorbs moisture. Over time, it can grow moss, green algae, or collect stains from spills and falling leaves. Regular pressure washing and chemical sealing are needed.</li>
          <li><strong>Porcelain:</strong> Extremely low maintenance. Porcelain has an water absorption rate of under 0.05%, making it completely impermeable to water, wine, grease, oil, and moss. To clean it, simply wash it down with soapy water.</li>
        </ul>
        
        <h3>3. Installation Complexity</h3>
        <p>Sandstone is calibrated to 22mm thickness and is relatively forgiving to lay. Porcelain is harder to cut and requires a diamond blade. It is mandatory to use a specialist bonding primer on the back of porcelain tiles, along with concrete spacers to achieve tight, uniform 3–5mm grout joints.</p>
        
        <h3>4. Slippiness & Safety</h3>
        <p>JMD premium porcelain is vitrified with a textured, anti-slip surface rated to <strong>R11</strong> (slip resistance in wet conditions). This makes it just as safe as natural sandstone for pool surrounds, patios, and wet garden pathways.</p>
        
        <h3>Summary Verdict</h3>
        <p>Choose <strong>Indian Sandstone</strong> if you want a classic, rustic, or natural look at a lower initial material cost. Choose <strong>Porcelain</strong> if you want a sleek, modern, low-maintenance outdoor space that looks identical year after year.</p>
      </div>
    )
  },
  {
    title: "The Ultimate Guide to Sealing Natural Stone Slabs",
    slug: "ultimate-guide-to-sealing-natural-stone",
    excerpt: "Should you seal your sandstone, limestone, or slate? Discover the best sealing products, correct application times, and how to avoid moisture stains.",
    date: "April 02, 2026",
    author: "Yard Operations",
    category: "Care & Maintenance",
    readTime: "5 min read",
    image: "https://jmdglobalstones.co.uk/wp-content/uploads/2025/01/KG-Sandstone-300x300.png",
    content: (
      <div>
        <h3>Why Seal Natural Stone?</h3>
        <p>Sandstone, limestone, and slate are porous natural materials. Without protection, they act like a hard sponge, soaking up rain, dirt, leaf tannins, bird droppings, and spills. Sealing blocks these pores, keeping your stone looking cleaner for longer and preventing frost damage.</p>
        
        <h3>1. Impregnating vs. Topical Sealers</h3>
        <ul>
          <li><strong>Impregnating Sealers (Recommended):</strong> These sit below the surface of the stone without altering its slip resistance or color. They allow the stone to "breathe" out natural moisture while blocking foreign liquids from entering.</li>
          <li><strong>Topical (Wet-Look) Sealers:</strong> These create a glossy, plastic-like film over the top. While they enhance color, they can make natural stone very slippery when wet and trap moisture inside, causing white flaking.</li>
        </ul>
        
        <h3>2. The Golden Rule of Timing</h3>
        <p>Do not seal natural stone immediately after laying it. The mortar bed releases natural salts called efflorescence. If you seal the stone too early, you will trap these white powdery salts permanently under the seal. Always wait **at least 8 to 12 weeks** of dry weather for the mortar bed to cure completely before applying a sealer.</p>
        
        <h3>3. Step-by-Step Application</h3>
        <ol>
          <li><strong>Clean thoroughly:</strong> Power wash the patio and ensure there is no dust, moss, or grease. Let it dry completely for 24-48 hours.</li>
          <li><strong>Check the weather:</strong> Choose a dry day with temperatures between 10°C and 22°C. Avoid rain forecasts for 24 hours.</li>
          <li><strong>Apply evenly:</strong> Use a roller, soft brush, or low-pressure sprayer. Apply a thin, even coat. Do not allow the sealer to pool in natural riven crevices.</li>
          <li><strong>Second coat:</strong> For highly porous sandstone, apply a second coat "wet-on-wet" within 30 minutes of the first.</li>
        </ol>
        <p>Sealers typically protect the stone for 2 to 3 years before requiring a light re-application.</p>
      </div>
    )
  },
  {
    title: "5 Modern Garden Designs Using Grey Anthracite Porcelain",
    slug: "modern-garden-designs-grey-porcelain",
    excerpt: "Be inspired by stunning contemporary garden patio designs featuring large-format dark porcelain tiles, minimalist furniture, and architectural lighting.",
    date: "March 18, 2026",
    author: "Design Team",
    category: "Inspiration",
    readTime: "5 min read",
    image: "/gallery-porcelain.png",
    content: (
      <div>
        <h3>The Rise of Dark Anthracite</h3>
        <p>Anthracite and dark grey porcelain paving have become the gold standard for high-end modern UK garden designs. The deep, rich charcoal tones create a striking contrast with green lawns and bright borders, making outdoor spaces feel like a luxury extension of the home. Here are 5 design ideas utilizing JMD County Anthracite tiles.</p>
        
        <h3>1. The Seamless Indoor-to-Outdoor Flush Threshold</h3>
        <p>Lay the same style of anthracite porcelain tiles in your kitchen and out onto your garden patio. Keep the grout lines aligned and maintain a flush floor level (using a slim linear drainage channel at the door). When you slide open your bi-fold doors, your kitchen and garden instantly merge into one massive living space.</p>
        
        <h3>2. Raised Cedar planter contrasts</h3>
        <p>Dark charcoal porcelain pairs beautifully with warm cedar cladding or slatted wooden fencing. Build raised masonry planters clad in horizontal cedar wood panels directly adjacent to your anthracite paving. The warm orange wood tones pop beautifully against the clean, cool charcoal background.</p>
        
        <h3>3. Zoning with contrasting light grey slabs</h3>
        <p>Create visual interest by using two different porcelain styles to zone your garden. Use JMD County Anthracite for your primary dining zone, and create a walkway or separate fire-pit lounging area using JMD Quartz Light Grey tiles. This breaks up flat spaces and adds architectural depth.</p>
        
        <h3>4. Floating steps with integrated LED strips</h3>
        <p>For multi-level gardens, build floating steps using anthracite tiles. Extend the step nosing (bullnose edge) by 30-40mm and hide warm white LED strip lights underneath. At night, this casts a soft downlight onto the steps, emphasizing the clean lines and creating a safe, ambient outdoor lounge feel.</p>
        
        <h3>5. Minimalist monochrome dining</h3>
        <p>Embrace a fully modern look by matching your paving with black metal-framed outdoor furniture, white plaster walls, and structural green plants like ornamental grasses or bamboo. The monochromatic scheme feels chic, sophisticated, and stays looking clean all year round.</p>
      </div>
    )
  }
];

export default function Blog() {
  const [readingPost, setReadingPost] = useState(null);

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
                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted-on-light)', marginBottom: '1rem', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={12} /> {post.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <User size={12} /> {post.author}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={12} /> {post.readTime}
                  </span>
                </div>

                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 400, lineHeight: 1.25, marginBottom: '1rem' }}>
                  {post.title}
                </h2>

                <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem', flexGrow: 1 }}>
                  {post.excerpt}
                </p>

                <div>
                  <button 
                    onClick={() => setReadingPost(post)}
                    className="btn btn-secondary" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', padding: '0.75rem 1.5rem', letterSpacing: '0.05em', cursor: 'pointer', border: '1px solid var(--color-border-light)' }}
                  >
                    Read Full Article <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Premium Full-Text Reader Modal */}
      {readingPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '2rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#F5F0E8', // Warm cream paper background
            width: '100%',
            maxWidth: '780px',
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'modalSlideUp 0.3s ease'
          }}>
            
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 2.5rem',
              backgroundColor: 'var(--bg-dark)',
              borderBottom: '1px solid var(--color-border-dark)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
                <Tag size={12} /> {readingPost.category}
              </div>
              <button 
                onClick={() => setReadingPost(null)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div style={{
              flexGrow: 1,
              overflowY: 'auto',
              padding: '3rem 3.5rem',
              lineHeight: 1.8,
              fontSize: '1rem',
              color: '#333333'
            }} className="article-body">
              
              {/* Article Meta */}
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted-on-light)', marginBottom: '1rem', borderBottom: '1px solid #D9D2C5', paddingBottom: '1rem' }}>
                <span>Date: <strong>{readingPost.date}</strong></span>
                <span>By: <strong>{readingPost.author}</strong></span>
                <span>Time: <strong>{readingPost.readTime}</strong></span>
              </div>

              {/* Title */}
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--text-on-light)', lineHeight: 1.2, marginBottom: '2rem' }}>
                {readingPost.title}
              </h1>

              {/* Banner Image */}
              <div style={{ height: '320px', width: '100%', marginBottom: '2.5rem', overflow: 'hidden', border: '1px solid #D9D2C5' }}>
                <img src={readingPost.image} alt={readingPost.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Content Body */}
              <div style={{ fontSize: '1.02rem' }}>
                {readingPost.content}
              </div>

              {/* Author footer */}
              <div style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid #D9D2C5', display: 'flex', gap: '1.5rem', alignItems: 'center', backgroundColor: '#EBE4D9' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-dark)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.1rem' }}>
                  {readingPost.author.split(' ')[0][0]}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>Written by {readingPost.author}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted-on-light)' }}>Technical Yard Operations Advisor at JMD Global Stones.</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      <style>{`
        .blog-grid { transition: opacity 0.3s; }
        .article-body h3 {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          font-weight: 400;
          color: var(--text-on-light);
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        .article-body p {
          margin-bottom: 1.5rem;
        }
        .article-body ul, .article-body ol {
          margin-bottom: 2rem;
          padding-left: 1.5rem;
        }
        .article-body li {
          margin-bottom: 0.5rem;
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .blog-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .article-body { padding: 2rem 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
