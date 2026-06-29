import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Truck, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, Package, Layers, Info } from 'lucide-react';
import { apiFetch } from '../api.js';
import useSEO from '../hooks/useSEO.js';

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

  useEffect(() => {
    const el = carouselRef.current;
    if (!el || relatedProducts.length === 0) return;

    let intervalId;
    let direction = 1; // 1 = right, -1 = left

    const autoScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      let nextScroll = el.scrollLeft + (1 * direction);

      if (nextScroll >= maxScroll) {
        direction = -1;
        nextScroll = maxScroll;
      } else if (nextScroll <= 0) {
        direction = 1;
        nextScroll = 0;
      }

      el.scrollLeft = nextScroll;
    };

    intervalId = setInterval(autoScroll, 40); // slow, smooth drift

    const pauseScroll = () => clearInterval(intervalId);
    const resumeScroll = () => {
      clearInterval(intervalId);
      intervalId = setInterval(autoScroll, 40);
    };

    el.addEventListener('mouseenter', pauseScroll);
    el.addEventListener('mouseleave', resumeScroll);
    el.addEventListener('touchstart', pauseScroll);
    el.addEventListener('touchend', resumeScroll);

    return () => {
      clearInterval(intervalId);
      if (el) {
        el.removeEventListener('mouseenter', pauseScroll);
        el.removeEventListener('mouseleave', resumeScroll);
        el.removeEventListener('touchstart', pauseScroll);
        el.removeEventListener('touchend', resumeScroll);
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
      default: return {
        origin: 'Global Imports',
        classification: 'Natural Stone',
        finish: 'Calibrated Paving Slabs',
        slip: 'R11 (Safe Outdoor Grip)',
        absorption: '<2.0%',
        compressive: '100 MPa',
        thickness: '22mm Standard'
      };
    }
  };

  const specs = getTechnicalDetails(product.category);
  const otherSizes = groupVariants.filter(v => v.id !== product.id);

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '5rem 0', minHeight: '100vh' }}>
      
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
          <div>
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

            {/* Similar Products — compact strip below main image */}
            {relatedProducts.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--text-muted-on-light)', marginBottom: '1rem' }}>
                  View Similar Products
                </p>
                <div
                  ref={carouselRef}
                  className="similar-products-scroll"
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem',
                  }}
                >
                  {relatedProducts.map((prod) => (
                    <Link
                      key={prod.id}
                      to={`/products/${prod.slug}`}
                      className="similar-product-card"
                      style={{
                        width: '150px',
                        flexShrink: 0,
                        textDecoration: 'none',
                        color: 'inherit',
                        border: '1px solid var(--color-border-light)',
                        backgroundColor: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                      }}
                    >
                      <div style={{ width: '100%', height: '110px', overflow: 'hidden' }}>
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="similar-card-img"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.35s ease' }}
                        />
                      </div>
                      <div style={{ padding: '0.65rem 0.75rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.05em' }}>{prod.category}</span>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.35, color: 'var(--text-on-light)', margin: 0 }}>{prod.name}</p>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-on-light)', margin: '0.3rem 0 0' }}>£{prod.price.toFixed(2)}</p>
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
                    <p style={{ marginBottom: '0.5rem' }}>• <strong>Access Required:</strong> Kerbside delivery via an 18-28 tonne HGV tail-lift lorry.</p>
                    <p style={{ marginBottom: '0.75rem' }}>• <strong>Rates:</strong> Flat rate of £49 per order. Direct import rates apply.</p>
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
                {openAccordions.patterns && (
                  <div style={{ paddingBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted-on-light)', lineHeight: 1.6 }}>
                    {product.category === 'Sandstone' ? (
                      <>
                        <p style={{ marginBottom: '0.75rem' }}><strong>Modular Multi-Size Pattern (Project Packs):</strong></p>
                        <p style={{ marginBottom: '0.5rem' }}>Standard project packs contain 4 stone dimensions: 900x600mm, 600x600mm, 600x290mm, and 290x290mm.</p>
                        <p style={{ marginBottom: '0.5rem' }}>• Avoid continuous linear joints (crosses). Stagger joints by at least 100mm.</p>
                        <p>• Lay flags from multiple crates simultaneously to blend organic color shade variations smoothly.</p>
                      </>
                    ) : (
                      <>
                        <p style={{ marginBottom: '0.75rem' }}><strong>Linear / Stretcher Bond Pattern (Single Sizes):</strong></p>
                        <p style={{ marginBottom: '0.5rem' }}>For single size flags (e.g. 900x600mm porcelain), lay in a staggered brick bond pattern.</p>
                        <p style={{ marginBottom: '0.5rem' }}>• Stagger flags by 1/3 (offset of 300mm) or 1/2 (offset of 450mm).</p>
                        <p>• Avoid laying stack-bond (grid-aligned) unless executing ultra-modern vertical tiling layouts.</p>
                      </>
                    )}
                  </div>
                )}
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
        .similar-products-scroll::-webkit-scrollbar {
          display: none;
        }
        .similar-products-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .similar-product-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.10);
          transform: translateY(-3px);
        }
        .similar-product-card:hover .similar-card-img {
          transform: scale(1.04);
        }
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
