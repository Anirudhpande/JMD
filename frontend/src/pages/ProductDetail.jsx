import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Truck, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, Package, Layers, Info } from 'lucide-react';
import { apiFetch } from '../api.js';
import useSEO from '../hooks/useSEO.js';
import ProductCardImage from '../components/ProductCardImage.jsx';

export default function ProductDetail({ addToCart }) {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [groupVariants, setGroupVariants] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Gallery state
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Quantity State
  const [quantity, setQuantity] = useState(1);

  // Coverage Calculator State
  const [calcArea, setCalcArea] = useState('');
  const [calcIncludeWastage, setCalcIncludeWastage] = useState(true);

  // Accordions state
  const [openAccordions, setOpenAccordions] = useState({
    delivery: true,
    specifications: false,
    care: false,
    patterns: false
  });

  const carouselRef = React.useRef(null);

  // Auto-slide similar products: advance one card every 2 seconds
  useEffect(() => {
    if (!relatedProducts.length) return;
    let paused = false;
    const CARD_W = 182; // px — must match card width + gap below

    const tick = setInterval(() => {
      const el = carouselRef.current;
      if (!el || paused) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      if (el.scrollLeft >= maxScroll - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: CARD_W, behavior: 'smooth' });
      }
    }, 2000);

    const pause  = () => { paused = true; };
    const resume = () => { paused = false; };

    const el = carouselRef.current;
    if (el) {
      el.addEventListener('mouseenter', pause);
      el.addEventListener('mouseleave', resume);
      el.addEventListener('touchstart', pause);
      el.addEventListener('touchend',   resume);
    }

    return () => {
      clearInterval(tick);
      if (el) {
        el.removeEventListener('mouseenter', pause);
        el.removeEventListener('mouseleave', resume);
        el.removeEventListener('touchstart', pause);
        el.removeEventListener('touchend',   resume);
      }
    };
  }, [relatedProducts]);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setActiveImageIdx(0);
        setQuantity(1);
        setCalcArea('');
        
        // Fetch group variants if variant_group_id exists
        if (data.variant_group_id) {
          apiFetch(`/api/variant-groups/${data.variant_group_id}`)
            .then(res => res.json())
            .then(variants => {
              setGroupVariants(variants);
            })
            .catch(err => console.error('Error fetching variant groups:', err));
        } else {
          setGroupVariants([]);
        }

        // Fetch related products (same category, different slug)
        apiFetch('/api/products')
          .then(res => res.json())
          .then(allProducts => {
            const related = allProducts.filter(
              p => p.category === data.category && p.slug !== data.slug && p.variant_group_id !== data.variant_group_id
            ).slice(0, 4);
            setRelatedProducts(related);
          });

        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product details:', err);
        setLoading(false);
      });
  }, [slug]);

  useSEO({
    title: product ? `${product.name} | Buy ${product.category} Paving Slabs UK` : 'Product | JMD Global Stones',
    description: product
      ? `Buy ${product.name} paving slabs from JMD Global Stones. ${product.description ? product.description.slice(0, 120) + '...' : ''} UK-wide delivery available.`
      : 'Premium natural stone paving slabs with UK-wide delivery.',
    image: product?.images?.[0] || undefined,
    canonical: product ? `https://jmdglobalstones.co.uk/products/${product.slug}` : undefined,
    jsonLd: product ? {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: product.images || [],
      description: product.description || '',
      brand: { '@type': 'Brand', name: 'JMD Global Stones' },
      offers: {
        '@type': 'Offer',
        url: `https://jmdglobalstones.co.uk/products/${product.slug}`,
        priceCurrency: 'GBP',
        price: product.price,
        availability: (product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'JMD Global Stones' }
      },
      aggregateRating: product.stars ? {
        '@type': 'AggregateRating',
        ratingValue: product.stars,
        bestRating: 5,
        worstRating: 1,
        ratingCount: product.review_count || 12
      } : undefined
    } : undefined
  });

  if (loading) {
    return (
      <div style={{ padding: '8rem 0', textAlign: 'center', backgroundColor: 'var(--bg-light)', minHeight: '80vh' }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted-on-light)', fontSize: '1rem' }}>Loading material details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '8rem 0', textAlign: 'center', backgroundColor: 'var(--bg-light)', minHeight: '80vh' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 400 }}>Material Not Found</h2>
          <p style={{ color: 'var(--text-muted-on-light)', margin: '1.5rem 0 2.5rem 0' }}>The stone paving slab you are looking for does not exist in our yard inventories.</p>
          <Link to="/products" className="btn btn-primary">Back to Catalog</Link>
        </div>
      </div>
    );
  }

  const stockQty = product.stock || 0;
  const isOutOfStock = stockQty === 0;
  const isLowStock = stockQty > 0 && stockQty <= 5; // Low stock threshold is <= 5

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper: Coverage conversions based on size name
  const getPackCoverage = (sizeName) => {
    if (!sizeName) return 15.0;
    const match = sizeName.match(/Covers\s+([\d.]+)/i);
    if (match) {
      return parseFloat(match[1]);
    }
    const lower = sizeName.toLowerCase();
    if (lower.includes('project pack') || lower.includes('mixed')) return 18.9;
    if (lower.includes('900x600')) return 17.0;
    return 15.0; // fallback standard coverage
  };

  const packCoverage = getPackCoverage(product.size);
  const baseArea = parseFloat(calcArea) || 0;
  const areaWithWastage = calcIncludeWastage ? baseArea * 1.1 : baseArea;
  const packsNeeded = baseArea > 0 ? Math.ceil(areaWithWastage / packCoverage) : 0;
  const calculatedPrice = packsNeeded * product.price;

  const handleApplyPacks = () => {
    if (packsNeeded > 0) {
      setQuantity(Math.min(stockQty, packsNeeded));
    }
  };

  // Technical Specs details based on category
  const getTechnicalDetails = (category) => {
    switch (category) {
      case 'Sandstone': return {
        origin: 'Rajasthan, India',
        classification: 'Sedimentary Quartzite',
        finish: 'Natural Riven & Calibrated',
        slip: 'R11 (High Wet Grip)',
        absorption: '1.5% (Very Low)',
        compressive: '142 MPa',
        thickness: '22mm Calibrated (+/- 2mm)'
      };
      case 'Porcelain': return {
        origin: 'Emilia-Romagna, Italy',
        classification: 'Vitrified Outdoor Ceramic',
        finish: 'Matte Anti-Slip Textured',
        slip: 'R11 / PTV 36+ (Pool Safe)',
        absorption: '<0.05% (Near Impermeable)',
        compressive: '350 MPa',
        thickness: '20mm Vitrified Sawn'
      };
      case 'Bricks': return {
        origin: 'Rajasthan, India',
        classification: 'Handmade Clay Facing Brick',
        finish: 'Standard / Handmade',
        slip: 'N/A (Walling Product)',
        absorption: '< 12% (EN 771-1)',
        compressive: '≥ 15 MPa (Class M15)',
        thickness: '68mm (Tolerances: T2, R2)'
      };
      default: return {
        origin: 'Global Imports',
        classification: 'Natural Stone',
        finish: 'Calibrated Paving Slabs',
        slip: 'R11 (Safe Outdoor Grip)',
        absorption: '< 2.0%',
        compressive: '100 MPa',
        thickness: '22mm Standard'
      };
    }
  };

  const specs = getTechnicalDetails(product.category);
  const otherSizes = groupVariants.filter(v => v.id !== product.id);

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '2.5rem 0 5rem 0', minHeight: '100vh' }}>
      
      {/* Dynamic SEO JSON-LD block */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "image": product.images,
          "description": product.description,
          "sku": product.id,
          "brand": {
            "@type": "Brand",
            "name": "JMD Global Stones"
          },
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "GBP",
            "lowPrice": product.price,
            "highPrice": groupVariants.length > 0 ? Math.max(...groupVariants.map(v => v.price)) : product.price,
            "offerCount": groupVariants.length || 1,
            "availability": "https://schema.org/InStock"
          }
        })}
      </script>

      <div className="container">
        
        {/* Breadcrumbs */}
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted-on-light)', marginBottom: '3rem' }}>
          <Link to="/">Home</Link> &nbsp;&nbsp;/&nbsp;&nbsp; 
          <Link to="/products">Products</Link> &nbsp;&nbsp;/&nbsp;&nbsp; 
          <Link to={`/products?category=${product.category.toLowerCase()}`}>{product.category}</Link> &nbsp;&nbsp;/&nbsp;&nbsp; 
          <span style={{ color: 'var(--text-on-light)' }}>{product.name}</span>
        </div>

        {/* Product Details Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '5rem', marginBottom: '6rem' }} className="detail-layout">
          
          {/* Gallery Column */}
          <div style={{ position: 'sticky', top: '115px', alignSelf: 'start' }}>
            <div style={{ width: '100%', aspectRatio: '1.1', backgroundColor: '#EBE4D9', border: '1px solid var(--color-border-light)', marginBottom: '1.25rem', overflow: 'hidden' }}>
              <img 
                src={product.images[activeImageIdx]} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIdx(idx)}
                    style={{ width: '80px', height: '80px', flexShrink: 0, border: activeImageIdx === idx ? '1px solid var(--color-accent)' : '1px solid var(--color-border-light)', overflow: 'hidden', cursor: 'pointer', backgroundColor: 'transparent' }}
                  >
                    <img src={img} alt={`${product.name} Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Similar Products — 2-second auto-slide carousel */}
            {relatedProducts.length > 0 && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1.5rem' }}>
                <p style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, color: 'var(--text-muted-on-light)', marginBottom: '1rem', margin: '0 0 1rem' }}>
                  View Similar Products
                </p>
                <div
                  ref={carouselRef}
                  className="sim-scroll"
                >
                  {relatedProducts.map((prod) => (
                    <Link
                      key={prod.id}
                      to={`/products/${prod.slug}`}
                      className="sim-card"
                    >
                      <div className="sim-card-img-wrap">
                        <ProductCardImage
                          images={prod.images}
                          name={prod.name}
                          category={prod.category}
                          inStock={true}
                          aspectRatio="auto"
                          objectFit="contain"
                          padding="6px"
                          style={{ height: '100%', width: '100%', border: 'none', backgroundColor: 'transparent', marginBottom: 0 }}
                        />
                      </div>
                      <div className="sim-card-body">
                        <p className="sim-card-name">{prod.name}</p>
                        <p className="sim-card-price">£{prod.price.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Details Column */}
          <div>
            <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15rem' }}>
              {product.category} Collection
            </span>
            <h1 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-heading)', marginTop: '0.75rem', marginBottom: '1.25rem', lineHeight: 1.15, fontWeight: 400 }}>
              {product.name}
            </h1>

            {/* Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-accent)', marginBottom: '2rem' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.floor(product.stars) ? 'currentColor' : 'none'} style={{ strokeWidth: 1.5 }} />
              ))}
              <span style={{ color: 'var(--text-muted-on-light)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>({product.stars} review rating)</span>
            </div>

            {/* Price Display */}
            <div style={{ paddingBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}>
                £{product.price.toFixed(2)}
                <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted-on-light)', marginLeft: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>ex. VAT / pack</span>
              </div>
            </div>

            {/* Product Description */}
            <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              {product.description}
            </p>

            {/* Size & Format Selector */}
            {groupVariants.length > 0 && (
              <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem', color: 'var(--text-on-light)' }}>
                  Select Paving Format / Size:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {groupVariants.map((v) => {
                    const isCurrent = v.id === product.id;
                    const isMixed = v.size.toLowerCase().includes('mixed') || v.size.toLowerCase().includes('project pack');
                    const labelTitle = isMixed ? 'Project Pack (Mixed Sizes)' : '900x600mm (Single Size)';
                    const covMatch = v.size.match(/Covers\s+([\d.]+)/i);
                    const coverage = covMatch ? `${covMatch[1]} m²` : (isMixed ? '18.9 m²' : '17.0 m²');
                    
                    return (
                      <Link 
                        key={v.id}
                        to={`/products/${v.slug}`}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '1.25rem', 
                          border: isCurrent ? '2px solid var(--color-accent)' : '1px solid var(--color-border-light)', 
                          backgroundColor: isCurrent ? '#FFFFFF' : 'transparent',
                          cursor: 'pointer', 
                          textAlign: 'left',
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: 'all 0.25s ease'
                        }}
                        className="variant-option-card"
                      >
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{ 
                            width: '18px', 
                            height: '18px', 
                            borderRadius: '50%', 
                            border: '1px solid var(--color-accent)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isCurrent && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-on-light)' }}>{labelTitle}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', marginTop: '0.15rem' }}>
                              {v.size} • Approx. {coverage} coverage
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600, fontSize: '1.15rem', color: 'var(--color-accent)' }}>
                            £{v.price.toFixed(2)}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted-on-light)', textTransform: 'uppercase' }}>
                            ex. VAT / pack
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}


            {/* Interactive Patio Coverage Calculator */}
            {product.category !== 'Bricks' && (
              <div style={{ border: '1px solid var(--color-border-light)', padding: '1.75rem', backgroundColor: '#EBE4D9', marginBottom: '2.5rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '1rem' }}>
                  <Layers size={15} style={{ color: 'var(--color-accent)' }} /> Patio Coverage Calculator
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted-on-light)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Enter your total patio area in square meters. We'll convert it to required packs, based on this pack's coverage of <strong>{packCoverage} m²</strong>.
                </p>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }} className="calc-inputs">
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', flexGrow: 1, padding: '0.5rem 0.75rem' }}>
                    <input 
                      type="number" 
                      min="1" 
                      value={calcArea} 
                      onChange={(e) => setCalcArea(e.target.value)} 
                      placeholder="Patio Area (m²)" 
                      style={{ width: '100%', padding: '0.25rem', fontSize: '0.9rem' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted-on-light)', marginLeft: '0.5rem' }}>m²</span>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => setCalcIncludeWastage(!calcIncludeWastage)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-on-light)', cursor: 'pointer' }}
                  >
                    <div style={{ width: '16px', height: '16px', border: '1px solid var(--color-border-light)', backgroundColor: calcIncludeWastage ? 'var(--color-accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {calcIncludeWastage && <CheckCircle size={12} style={{ color: '#111111' }} />}
                    </div>
                    Add 10% wastage
                  </button>
                </div>

                {packsNeeded > 0 && (
                  <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      <div>
                        <p style={{ color: 'var(--text-muted-on-light)' }}>Packs Required:</p>
                        <p style={{ fontWeight: 600, fontSize: '1rem' }}>{packsNeeded} wooden crates</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-muted-on-light)' }}>Total Area covered:</p>
                        <p style={{ fontWeight: 600, fontSize: '1rem' }}>{(packsNeeded * packCoverage).toFixed(1)} m²</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                        Total cost: £{calculatedPrice.toFixed(2)}
                      </div>
                      <button 
                        type="button" 
                        onClick={handleApplyPacks}
                        style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)', cursor: 'pointer', border: '1px solid var(--color-accent)', padding: '0.5rem 1rem', transition: 'var(--transition-smooth)' }}
                        className="btn-outline-gold"
                      >
                        Apply to Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stock Warning & Add to Cart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '3rem', marginBottom: '2.5rem' }}>
              
              {/* Stock Status Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isOutOfStock ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <AlertTriangle size={16} />
                    <span>Out of Stock — Register for restock alerts</span>
                  </div>
                ) : isLowStock ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D9822B', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <AlertTriangle size={16} />
                    <span>Low Stock Alert — Only {stockQty} packs remaining</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <CheckCircle size={16} />
                    <span>In Stock — Dispatched in 3-5 business days</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector and Action Button */}
              {!isOutOfStock && (
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', height: '54px' }}>
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={{ padding: '0 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 0.5rem', fontWeight: 600, fontSize: '0.95rem', minWidth: '40px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(q => Math.min(stockQty, q + 1))}
                      style={{ padding: '0 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem' }}
                    >
                      +
                    </button>
                  </div>

                  <button 
                    onClick={() => addToCart(product, product.size, quantity, product.price)}
                    className="btn btn-primary" 
                    style={{ flexGrow: 1, height: '54px', fontSize: '0.8rem', letterSpacing: '0.12em' }}
                  >
                    Add to Basket
                  </button>
                </div>
              )}
            </div>

            {/* Accordions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              
              {/* Delivery Accordion */}
              <div style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <button 
                  onClick={() => toggleAccordion('delivery')}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1.25rem 0', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-on-light)' }}><Truck size={15} style={{ color: 'var(--color-accent)' }} /> Delivery Guidelines</span>
                  {openAccordions.delivery ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                {openAccordions.delivery && (
                  <div style={{ paddingBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted-on-light)', lineHeight: 1.6 }}>
                    <p style={{ marginBottom: '0.5rem' }}>• <strong>Timeline:</strong> Deliveries are executed in 3-5 business days.</p>
                    {/* <p style={{ marginBottom: '0.5rem' }}>• <strong>Access Required:</strong> Kerbside delivery via an 18-28 tonne HGV tail-lift lorry.</p> */}
                    <Link to="/delivery" style={{ color: 'var(--color-accent)', fontWeight: 500, textDecoration: 'underline' }}>Read our complete Delivery Guide</Link>
                  </div>
                )}
              </div>

              {/* Specifications Accordion */}
              <div style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <button 
                  onClick={() => toggleAccordion('specifications')}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1.25rem 0', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-on-light)' }}><Package size={15} style={{ color: 'var(--color-accent)' }} /> Material Specifications</span>
                  {openAccordions.specifications ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                {openAccordions.specifications && (
                  <div style={{ paddingBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted-on-light)', lineHeight: 1.6 }}>
                    <p style={{ marginBottom: '0.5rem' }}>• <strong>Calibration:</strong> Calibrated thickness of {specs.thickness} for easy laying.</p>
                    <p style={{ marginBottom: '0.5rem' }}>• <strong>Finish:</strong> {specs.finish} surface splits for a premium finish.</p>
                    <p>• <strong>Suitability:</strong> Completely frost resistant and perfect for patio, paths, and garden landscaping.</p>
                  </div>
                )}
              </div>

              {/* Layout Patterns Accordion */}
              <div style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <button 
                  onClick={() => toggleAccordion('patterns')}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1.25rem 0', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-on-light)' }}><Layers size={15} style={{ color: 'var(--color-accent)' }} /> Laying Patterns Guide</span>
                  {openAccordions.patterns ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                {openAccordions.patterns && (() => {
                  const isProjectPack = product.name.toLowerCase().includes('project pack');
                  const isPorcelain   = product.category === 'Porcelain';
                  const isBricks      = product.category === 'Bricks';

                  return (
                    <div style={{ paddingBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted-on-light)', lineHeight: 1.7 }}>

                      {/* ── Project Pack ── */}
                      {isProjectPack && !isBricks && (
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--text-on-light)', marginBottom: '0.6rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Project Pack — Multi-Size Modular Layout
                          </p>
                          <p style={{ marginBottom: '0.75rem' }}>
                            Each Project Pack contains four complementary stone sizes, carefully proportioned to produce a natural, random-pattern layout across your patio or pathway. One pack covers approximately <strong>18.9 m²</strong>.
                          </p>
                          <div style={{ background: '#f7f4ef', border: '1px solid #e0d9ce', padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
                            <p style={{ fontWeight: 600, color: 'var(--text-on-light)', marginBottom: '0.5rem', fontSize: '0.78rem' }}>Pack Composition:</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1.5rem' }}>
                              {[['16 pieces', '900 × 600 mm'], ['16 pieces', '600 × 600 mm'], ['16 pieces', '600 × 290 mm'], ['12 pieces', '290 × 290 mm']].map(([qty, size]) => (
                                <div key={size} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderBottom: '1px solid #e0d9ce' }}>
                                  <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{qty}</span>
                                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{size}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <p style={{ marginBottom: '0.4rem' }}>• Always lay flags from multiple packs simultaneously to blend natural colour and shade variations evenly across the surface.</p>
                          <p>• Stagger joints by a minimum of 100 mm in all directions — avoid forming continuous straight lines or cross joints.</p>
                        </div>
                      )}

                      {/* ── Sandstone Single Size (22 mm) ── */}
                      {!isProjectPack && !isPorcelain && !isBricks && (
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--text-on-light)', marginBottom: '0.6rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Single Size Pack — Stretcher Bond Layout (22 mm Calibrated)
                          </p>
                          <p style={{ marginBottom: '0.75rem' }}>
                            This single size pack supplies one consistent flag dimension, ideal for a clean, contemporary stretcher-bond layout. Each pack covers approximately <strong>17.0 m²</strong>.
                          </p>
                          <div style={{ background: '#f7f4ef', border: '1px solid #e0d9ce', padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
                            <p style={{ fontWeight: 600, color: 'var(--text-on-light)', marginBottom: '0.5rem', fontSize: '0.78rem' }}>Pack Composition:</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderBottom: '1px solid #e0d9ce' }}>
                              <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>30 pieces</span>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>900 × 600 mm</span>
                            </div>
                          </div>
                          <p style={{ marginBottom: '0.4rem' }}>• Lay in a staggered brick-bond pattern, offsetting each row by one-third (300 mm) or one-half (450 mm) of the flag length.</p>
                          <p>• Avoid a full stack-bond (grid) layout unless intentionally creating a formal, symmetrical design.</p>
                        </div>
                      )}

                      {/* ── Porcelain Single Size (20 mm) ── */}
                      {isPorcelain && !isBricks && (
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--text-on-light)', marginBottom: '0.6rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Single Size Pack — Stretcher Bond Layout (20 mm Porcelain)
                          </p>
                          <p style={{ marginBottom: '0.75rem' }}>
                            Porcelain single size packs supply large-format flags perfect for wide, open-plan patios and contemporary garden designs. Each pack covers approximately <strong>21.3 m²</strong>.
                          </p>
                          <div style={{ background: '#f7f4ef', border: '1px solid #e0d9ce', padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
                            <p style={{ fontWeight: 600, color: 'var(--text-on-light)', marginBottom: '0.5rem', fontSize: '0.78rem' }}>Pack Composition:</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderBottom: '1px solid #e0d9ce' }}>
                              <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>38 pieces</span>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>900 × 600 mm</span>
                            </div>
                          </div>
                          <p style={{ marginBottom: '0.4rem' }}>• Use a 3 mm joint width with a suitable porcelain tile adhesive rated for external use.</p>
                          <p style={{ marginBottom: '0.4rem' }}>• Lay in a staggered brick-bond pattern, offsetting each row by one-third (300 mm) for a modern linear finish.</p>
                          <p>• Porcelain flags are non-porous and require no sealing — simply clean with water and a pH-neutral cleaner.</p>
                        </div>
                      )}

                      {/* ── Bricks ── */}
                      {isBricks && (() => {
                        const isMulti = product.slug === 'smeed-dean-yellow-multi';
                        const qtyText = isMulti ? '30 pieces' : '360 bricks';
                        const sizeText = isMulti ? '900 × 600 mm' : '228 × 110 × 68 mm';
                        const headingText = isMulti 
                          ? 'Smeed Dean Yellow Multi — Laying Guide (900x600mm Pack)'
                          : `${product.name} — Laying Guide`;
                        const descText = isMulti
                          ? 'This pack supplies consistent large-format flags, ideal for a clean, contemporary layout.'
                          : 'This pack supplies traditional stock bricks, ideal for restoration work, character-rich walls, and partitions.';

                        return (
                          <div>
                            <p style={{ fontWeight: 700, color: 'var(--text-on-light)', marginBottom: '0.6rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {headingText}
                            </p>
                            <p style={{ marginBottom: '0.75rem' }}>
                              {descText}
                            </p>
                            <div style={{ background: '#f7f4ef', border: '1px solid #e0d9ce', padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
                              <p style={{ fontWeight: 600, color: 'var(--text-on-light)', marginBottom: '0.5rem', fontSize: '0.78rem' }}>Pack Composition:</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderBottom: '1px solid #e0d9ce' }}>
                                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{qtyText}</span>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{sizeText}</span>
                              </div>
                            </div>
                            {isMulti ? (
                              <>
                                <p style={{ marginBottom: '0.4rem' }}>• Lay in a staggered brick-bond pattern, offsetting each row by one-third (300 mm) or one-half (450 mm) of the flag length.</p>
                                <p>• Avoid a full stack-bond (grid) layout unless intentionally creating a formal, symmetrical design.</p>
                              </>
                            ) : (
                              <>
                                <p style={{ marginBottom: '0.4rem' }}>• Lay in a staggered brick-bond pattern, offsetting each row by one-half of the brick length.</p>
                                <p>• Ensure proper mortar jointing and level alignments throughout the laying process.</p>
                              </>
                            )}
                          </div>
                        );
                      })()}

                    </div>
                  );
                })()}
              </div>

            </div>

          </div>
        </div>

        {/* Detailed Technical Specifications Grid */}
        <section style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '4rem', marginBottom: '6rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em' }}>Architectural Specs</span>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: 400, marginTop: '0.5rem' }}>Technical Specification Profile</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }} className="specs-profile-grid">
            <div style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem', backgroundColor: 'transparent' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stone Origin</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-on-light)', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>{specs.origin}</p>
            </div>
            <div style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem', backgroundColor: 'transparent' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rock Classification</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-on-light)', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>{specs.classification}</p>
            </div>
            <div style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem', backgroundColor: 'transparent' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Surface Finish</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-on-light)', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>{specs.finish}</p>
            </div>
            <div style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem', backgroundColor: 'transparent' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slip Resistance</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-on-light)', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>{specs.slip}</p>
            </div>
            <div style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem', backgroundColor: 'transparent' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Water Absorption</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-on-light)', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>{specs.absorption}</p>
            </div>
            <div style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem', backgroundColor: 'transparent' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compressive Strength</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-on-light)', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>{specs.compressive}</p>
            </div>
            <div style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem', backgroundColor: 'transparent' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calibrated Thickness</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-on-light)', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>{specs.thickness}</p>
            </div>
            <div style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem', backgroundColor: 'transparent' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frost Durability</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-on-light)', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>Fully Frost Proof</p>
            </div>
          </div>
        </section>

      </div>
      
      <style>{`
        /* ---- Similar Products Carousel ---- */
        .sim-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .sim-scroll::-webkit-scrollbar { display: none; }

        .sim-card {
          width: 172px;
          flex-shrink: 0;
          scroll-snap-align: start;
          text-decoration: none;
          color: inherit;
          background: #fff;
          border: 1px solid #e0d9ce;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          height: 220px;
        }
        .sim-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.09);
        }
        .sim-card-img-wrap {
          width: 100%;
          height: 115px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #F8F5EF;
        }
        .sim-card-img {
          padding: 6px;
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: transform 0.35s ease;
        }
        .sim-card:hover .sim-card-img { transform: scale(1.05); }
        .sim-card-body {
          padding: 0.6rem 0.75rem 0.8rem;
        }
        .sim-card-name {
          font-size: 0.72rem;
          font-weight: 600;
          line-height: 1.35;
          color: #2a2218;
          margin: 0 0 0.35rem;
          padding: 0px 0px 20px 0px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .sim-card-price {
          font-size: 0.82rem;
          font-weight: 700;
          color: #8B6914;
          margin: 0;
        }
        /* ---- responsive ---- */
        @media (max-width: 768px) {
          .detail-layout { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .specs-profile-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1rem !important; }
        }
        @media (max-width: 480px) {
          .specs-profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  );
}
