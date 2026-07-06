import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Truck, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, Package, Layers, Info, Heart, Check } from 'lucide-react';
import { apiFetch } from '../api.js';
import useSEO from '../hooks/useSEO.js';
import ProductCardImage from '../components/ProductCardImage.jsx';

export default function ProductDetail({ addToCart }) {
  const { slug } = useParams();
  const navigate = useNavigate();
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

  // Magnifier Zoom State
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseMove = (e) => {
    if (window.innerWidth <= 1024) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Accordions state
  const [openAccordions, setOpenAccordions] = useState({
    delivery: true,
    specifications: false,
    care: false,
    patterns: false
  });

  const carouselRef = React.useRef(null);
  const isCarouselHovered = React.useRef(false);

  // Related Products Carousel Auto-Scroll Effect
  useEffect(() => {
    if (loading || relatedProducts.length === 0) return;

    const scrollInterval = setInterval(() => {
      const el = carouselRef.current;
      if (!el || isCarouselHovered.current) return;

      const cardWidth = 280 + 20; // card width + gap
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft >= maxScroll - 5) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, [loading, relatedProducts]);

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
            const related = allProducts.filter(p => p.slug !== data.slug && p.category === data.category);
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
      ? `Buy ${product.name} paving slabs from JMD Global Stones. ${product.description ? product.description.replace(/<[^>]*>/g, '').slice(0, 120) + '...' : ''} UK-wide delivery available.`
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

  // Helper: Coverage conversions based on size name and category
  const getPackCoverage = (sizeName, category) => {
    if (!sizeName) return 15.0;
    const match = sizeName.match(/Covers\s+([\d.]+)/i);
    if (match) {
      return parseFloat(match[1]);
    }
    const lower = sizeName.toLowerCase();
    if (category === 'Porcelain') {
      return 21.3;
    }
    if (category === 'Sandstone') {
      if (lower.includes('project pack') || lower.includes('mixed') || lower.includes('18.9')) return 18.9;
      if (lower.includes('900x600') || lower.includes('single')) return 17.0;
    }
    return 15.0; // fallback standard coverage
  };

  const packCoverage = getPackCoverage(product.size, product.category);
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
        origin: 'India',
        classification: 'Vitrified Outdoor Ceramic',
        finish: 'Matte Anti-Slip Textured',
        slip: 'R11 / PTV 36+ (Pool Safe)',
        absorption: '<0.05% (Near Impermeable)',
        compressive: '350 MPa',
        thickness: '20mm Vitrified Sawn'
      };
      case 'Bricks': {
        const isMulti = product?.slug === 'smeed-dean-yellow-multi';
        return {
          origin: 'India',
          classification: isMulti ? 'Smeed Dean Yellow Multi' : 'Smeed Yellow Bricks',
          finish: 'Standard / Handmade',
          slip: 'N/A (Walling Product)',
          absorption: '< 12% (EN 771-1)',
          compressive: '≥ 15 MPa (Class M15)',
          thickness: '68-70mm or Customisable For Fresh Bulk Orders',
          packContents: '228-232 x 108-112 x 68-70mm [Tolerances: T2, R2]'
        };
      }
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

  const formatSizePill = (sizeStr, productId) => {
    if (!sizeStr) return 'Standard';
    
    // Check if thickness is specified in the product ID
    let thickness = '';
    const thicknessMatch = productId?.match(/(\d+mm)/i);
    if (thicknessMatch) {
      thickness = `x${thicknessMatch[1]}`; // e.g. "x22mm" or "x20mm"
    }

    if (sizeStr.includes(' -- ')) {
      return sizeStr.split(' -- ')[0];
    }
    const lower = sizeStr.toLowerCase();
    if (lower.includes('project pack')) return 'Project Pack';
    
    const dimensionsMatch = sizeStr.match(/(\d+x\d+mm|\d+x\d+)/i);
    if (dimensionsMatch) {
      const baseDim = dimensionsMatch[0].replace(/mm/i, ''); // e.g. "900x600"
      return `${baseDim}${thickness || 'mm'}`; // e.g. "900x600x22mm" or "900x600mm"
    }
    return sizeStr;
  };

  const specs = getTechnicalDetails(product.category);
  const otherSizes = groupVariants.filter(v => v.id !== product.id);
  const handleBuyNow = () => {
    addToCart(product, product.size, quantity, product.price);
    navigate('/cart');
  };

  return (
    <div style={{ backgroundColor: '#FCFAF7', padding: '2rem 0 5rem 0', minHeight: '100vh', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      
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
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 0.5rem', color: '#ccc' }}>/</span> 
          <Link to="/products" style={{ color: '#888', textDecoration: 'none' }}>Products</Link>
          <span style={{ margin: '0 0.5rem', color: '#ccc' }}>/</span> 
          <Link to={`/products?category=${product.category.toLowerCase()}`} style={{ color: '#888', textDecoration: 'none' }}>{product.category}</Link>
          <span style={{ margin: '0 0.5rem', color: '#ccc' }}>/</span> 
          <span style={{ color: '#111', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* Main Details Grid */}
        <div className="detail-layout">
          
          {/* Left Column (Gallery + Large Similar Products Carousel) */}
          <div>
            {/* Main Image Banner */}
            <div 
              className="main-image-container"
              onMouseEnter={() => { if (window.innerWidth > 1024) setIsZooming(true); }}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              style={{ 
                backgroundColor: '#F5F1E9', 
                overflow: 'hidden', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative',
                cursor: 'zoom-in'
              }}
            >
              <img 
                src={product.images[activeImageIdx]} 
                alt={product.name} 
                style={{ 
                  maxWidth: '95%', 
                  maxHeight: '95%', 
                  objectFit: 'contain', 
                  display: 'block', 
                  imageRendering: 'auto',
                  transform: isZooming ? 'scale(2.2)' : 'scale(1)',
                  transformOrigin: isZooming ? `${zoomPos.x}% ${zoomPos.y}%` : 'center center',
                  transition: isZooming ? 'transform 0.08s ease-out' : 'transform 0.25s ease'
                }} 
              />
            </div>
            
            {/* Thumbnails Row */}
            {product.images.length > 1 && (
              <div className="thumbnails-container" style={{ display: 'flex', gap: '0.85rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIdx(idx)}
                    style={{ 
                      width: '90px', 
                      height: '90px', 
                      flexShrink: 0, 
                      borderRadius: '14px',
                      border: activeImageIdx === idx ? '2px solid #111111' : '1px solid #E5E0D8', 
                      cursor: 'pointer', 
                      backgroundColor: '#F5F1E9',
                      padding: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={img} alt={`${product.name} Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Similar Products */}
            {relatedProducts.length > 0 && (
              <div className="similar-products-section">
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ color: '#C9A96E', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em' }}>Recommendations</span>
                  <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 400, marginTop: '0.25rem', color: '#111', margin: '0.25rem 0 0' }}>Similar Products You May Like</h3>
                </div>
                
                <div 
                  ref={carouselRef}
                  className="sim-scroll"
                  onMouseEnter={() => isCarouselHovered.current = true}
                  onMouseLeave={() => isCarouselHovered.current = false}
                  onTouchStart={() => isCarouselHovered.current = true}
                  onTouchEnd={() => isCarouselHovered.current = false}
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
                          padding="10px"
                          style={{ height: '100%', width: '100%', border: 'none', backgroundColor: 'transparent', marginBottom: 0 }}
                        />
                      </div>
                      <div className="sim-card-body">
                        <p className="sim-card-name">{prod.name}</p>
                        <p className="sim-card-price">£{Number(prod.price || 0).toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Sticky Details + Checkout + Accordions + Specifications) */}
          <div className="right-column-card">
            <span style={{ color: '#C9A96E', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12rem' }}>
              {product.category} Collection
            </span>
            <h1 style={{ fontSize: '2.1rem', fontFamily: 'var(--font-heading)', marginTop: '0.25rem', marginBottom: '0.5rem', lineHeight: 1.15, fontWeight: 700, color: '#111' }}>
              {product.name}
            </h1>

            {/* Stars & Rating Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#C9A96E', marginBottom: '0.75rem' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.floor(product.stars) ? 'currentColor' : 'none'} style={{ strokeWidth: 1.5 }} />
              ))}
              <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: 500 }}>({product.stars} rating)</span>
            </div>

            {/* Product Description */}
            <div
              style={{ color: '#333', fontSize: '1rem', lineHeight: 1.6, marginTop: 0, marginBottom: '1.25rem' }}
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
            />



            {/* Price Display */}
            <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #EAE5DC', display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>
                £{Number(product.price || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                ex. VAT / pack
              </div>
            </div>

            {/* Interactive Patio Coverage Calculator */}
            {product.category !== 'Bricks' && (
              <div style={{ border: 'none', padding: '1rem', backgroundColor: '#F5F1E9', borderRadius: '16px', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, margin: '0 0 0.5rem', color: '#111' }}>
                  <Layers size={14} style={{ color: '#C9A96E' }} /> Patio Coverage Calculator
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#666', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                  Required packs based on <strong>{packCoverage} m²</strong> coverage per pack.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }} className="calc-inputs">
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D9D2C5', borderRadius: '8px', backgroundColor: '#FFFFFF', flexGrow: 1, padding: '0.45rem 0.75rem' }}>
                    <input 
                      type="number" 
                      min="1" 
                      value={calcArea} 
                      onChange={(e) => setCalcArea(e.target.value)} 
                      placeholder="Area (m²)" 
                      style={{ width: '100%', padding: '0.15rem', fontSize: '0.88rem', border: 'none', outline: 'none' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '0.5rem', fontWeight: 600 }}>m²</span>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => setCalcIncludeWastage(!calcIncludeWastage)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#111', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontWeight: 600 }}
                  >
                    <div style={{ width: '22px', height: '22px', borderRadius: '5px', border: '2px solid #C9A96E', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {calcIncludeWastage && <Check size={14} strokeWidth={3} style={{ color: '#C9A96E' }} />}
                    </div>
                    Add 10% wastage
                  </button>
                </div>

                {packsNeeded > 0 && (
                  <div style={{ borderTop: '1px solid #D9D2C5', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                      <div>
                        <p style={{ color: '#666', margin: '0 0 0.15rem' }}>Packs Required:</p>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, color: '#111' }}>{packsNeeded} wooden crates</p>
                      </div>
                      <div>
                        <p style={{ color: '#666', margin: '0 0 0.15rem' }}>Total Area covered:</p>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, color: '#111' }}>{(packsNeeded * packCoverage).toFixed(1)} m²</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111' }}>
                        Total cost: £{calculatedPrice.toFixed(2)} + Delivery + VAT
                      </div>
                      <button 
                        type="button" 
                        onClick={handleApplyPacks}
                        style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111', cursor: 'pointer', border: '1.5px solid #111', borderRadius: '20px', padding: '0.45rem 1.25rem', backgroundColor: 'transparent', fontWeight: 700, transition: 'all 0.2s ease' }}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              
              {/* Stock Status Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isOutOfStock ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d93838', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <AlertTriangle size={14} />
                    <span>Out of Stock — Register for restock alerts</span>
                  </div>
                ) : isLowStock ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D9822B', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <AlertTriangle size={14} />
                    <span>Low Stock Alert — Only {stockQty} packs remaining</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2b8a3e', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <CheckCircle size={14} />
                    <span>In Stock — Delivered in 5-7 business days</span>
                  </div>
                )
                }
              </div>

              {/* Quantity Selector and Action Buttons Row */}
              {!isOutOfStock && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  
                  {/* Quantity and buttons block */}
                  <div className="checkout-actions-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    
                    {/* Quantity Picker Capsule */}
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F0EBE1', borderRadius: '30px', padding: '0 4px', height: '48px' }}>
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        style={{ padding: '0 1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.1rem', border: 'none', backgroundColor: 'transparent', fontWeight: 600 }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0 0.15rem', fontWeight: 700, fontSize: '0.9rem', minWidth: '28px', textAlign: 'center', color: '#111' }}>
                        {quantity}
                      </span>
                      <button 
                        onClick={() => setQuantity(q => Math.min(stockQty, q + 1))}
                        style={{ padding: '0 1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.1rem', border: 'none', backgroundColor: 'transparent', fontWeight: 600 }}
                      >
                        +
                      </button>
                    </div>

                    {/* Buy Now Button (Solid Black) */}
                    <button 
                      onClick={handleBuyNow}
                      style={{ 
                        flexGrow: 1, 
                        height: '48px', 
                        fontSize: '0.8rem', 
                        letterSpacing: '0.08em', 
                        backgroundColor: '#111111', 
                        color: '#ffffff', 
                        borderRadius: '30px', 
                        fontWeight: 700, 
                        border: 'none', 
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        transition: 'all 0.25s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C9A96E'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#111111'}
                    >
                      Buy Now
                    </button>

                    {/* Add to Basket Button (Outline Black) */}
                    <button 
                      onClick={() => addToCart(product, product.size, quantity, product.price)}
                      style={{ 
                        flexGrow: 1, 
                        height: '48px', 
                        fontSize: '0.8rem', 
                        letterSpacing: '0.08em', 
                        backgroundColor: 'transparent', 
                        color: '#111111', 
                        borderRadius: '30px', 
                        fontWeight: 700, 
                        border: '1.5px solid #111111', 
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        transition: 'all 0.25s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#111111'; }}
                    >
                      Add To Cart
                    </button>

                    {/* Wishlist Button (Circle grey) */}
                    <button 
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%', 
                        border: '1px solid #D9D2C5', 
                        backgroundColor: '#FFFFFF', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        flexShrink: 0
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.color = '#C9A96E'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#D9D2C5'; e.currentTarget.style.color = 'inherit'; }}
                    >
                      <Heart size={16} />
                    </button>

                  </div>
                </div>
              )}
            </div>

            {/* Extra delivery text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#666', marginBottom: '2rem' }}>
              <Truck size={15} style={{ color: '#C9A96E' }} />
              <span>Nationwide Delivery • Dispatched in wooden crates • Tail-lift HGV • Kerbside Delivery</span>
            </div>

            {/* Accordions (Right Column) */}
            <div style={{ borderTop: '1px solid #EAE5DC', paddingTop: '1.5rem', marginBottom: '2rem' }}>
              <span style={{ color: '#C9A96E', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em' }}>User Guides</span>
              <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)', fontWeight: 400, marginTop: '0.25rem', color: '#111', marginBottom: '1rem' }}>Laying Patterns & Guidelines</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {/* Delivery Accordion */}
                <div style={{ borderBottom: '1px solid #EAE5DC' }}>
                  <button 
                    onClick={() => toggleAccordion('delivery')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.85rem 0', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', border: 'none', backgroundColor: 'transparent' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111' }}><Truck size={14} style={{ color: '#C9A96E' }} /> Delivery Guidelines</span>
                    {openAccordions.delivery ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openAccordions.delivery && (
                    <div style={{ paddingBottom: '1rem', fontSize: '0.82rem', color: '#555', lineHeight: 1.5 }}>
                      <p style={{ marginBottom: '0.4rem', margin: '0 0 0.4rem' }}>• <strong>Timeline:</strong> Deliveries are executed in 5-7 business days.</p>
                      <Link to="/delivery" style={{ color: '#C9A96E', fontWeight: 600, textDecoration: 'underline' }}>Read our complete Delivery Guide</Link>
                    </div>
                  )}
                </div>

                {/* Specifications Accordion */}
                <div style={{ borderBottom: '1px solid #EAE5DC' }}>
                  <button 
                    onClick={() => toggleAccordion('specifications')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.85rem 0', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', border: 'none', backgroundColor: 'transparent' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111' }}><Package size={14} style={{ color: '#C9A96E' }} /> Material Specifications</span>
                    {openAccordions.specifications ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openAccordions.specifications && (
                    <div style={{ paddingBottom: '1rem', fontSize: '0.82rem', color: '#555', lineHeight: 1.5 }}>
                      <p style={{ marginBottom: '0.4rem', margin: '0 0 0.4rem' }}>• <strong>Calibration:</strong> Calibrated thickness of {specs.thickness} for easy laying.</p>
                      <p style={{ marginBottom: '0.4rem', margin: '0 0 0.4rem' }}>• <strong>Finish:</strong> {specs.finish} surface splits for a premium finish.</p>
                      <p style={{ margin: 0 }}>• <strong>Suitability:</strong> Completely frost resistant and perfect for patio, paths, and garden landscaping.</p>
                    </div>
                  )}
                </div>

                {/* Layout Patterns Accordion */}
                <div style={{ borderBottom: '1px solid #EAE5DC' }}>
                  <button 
                    onClick={() => toggleAccordion('patterns')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.85rem 0', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', border: 'none', backgroundColor: 'transparent' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111' }}><Layers size={14} style={{ color: '#C9A96E' }} /> Laying Patterns Guide</span>
                    {openAccordions.patterns ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openAccordions.patterns && (() => {
                    const isProjectPack = product.name.toLowerCase().includes('project pack');
                    const isPorcelain   = product.category === 'Porcelain';
                    const isBricks      = product.category === 'Bricks';

                    return (
                      <div style={{ paddingBottom: '1rem', fontSize: '0.82rem', color: '#555', lineHeight: 1.5 }}>

                        {/* ── Project Pack ── */}
                        {isProjectPack && !isBricks && (
                          <div>
                            <p style={{ fontWeight: 700, color: '#111', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Project Pack — Multi-Size Modular Layout
                            </p>
                            <p style={{ marginBottom: '0.8rem', margin: '0 0 0.8rem', fontSize: '0.92rem' }}>
                              Each Project Pack contains four complementary stone sizes, modular layout. One pack covers approx <strong>18.9 m²</strong>.
                            </p>
                            <div style={{ background: '#f7f4ef', border: '1px solid #e0d9ce', padding: '1rem', marginBottom: '0.8rem', textAlign: 'center' }}>
                              <p style={{ fontWeight: 700, color: '#111', marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>Pack Composition - 60 Pieces (Mixed Sizes):</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '280px', margin: '0 auto' }}>
                                {[['16 pcs', '900 × 600 mm'], ['16 pcs', '600 × 600 mm'], ['16 pcs', '600 × 290 mm'], ['12 pcs', '290 × 290 mm']].map(([qty, size]) => (
                                  <div key={size} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #e0d9ce', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#C9A96E', fontWeight: 700 }}>{qty}</span>
                                    <span style={{ fontWeight: 600, color: '#111' }}>{size}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <p style={{ marginBottom: '0.3rem', margin: '0 0 0.3rem' }}>• Blend natural shades by mixing from multiple packs.</p>
                            <p style={{ margin: 0 }}>• Stagger joints by minimum 100 mm in all directions.</p>
                          </div>
                        )}

                        {/* ── Sandstone Single Size (22 mm) ── */}
                        {!isProjectPack && !isPorcelain && !isBricks && (
                          <div>
                            <p style={{ fontWeight: 700, color: '#111', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Single Size Pack — Stretcher Bond (22 mm)
                            </p>
                            <p style={{ marginBottom: '0.8rem', margin: '0 0 0.8rem', fontSize: '0.92rem' }}>
                              Stretcher-bond layout. One pack covers approx <strong>{packCoverage} m²</strong>.
                            </p>
                            <div style={{ background: '#f7f4ef', border: '1px solid #e0d9ce', padding: '1rem', marginBottom: '0.8rem', textAlign: 'center' }}>
                              <p style={{ fontWeight: 700, color: '#111', marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>Pack Composition - 30 Pieces (Single Size):</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '280px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #e0d9ce', fontSize: '0.95rem' }}>
                                  <span style={{ color: '#C9A96E', fontWeight: 700 }}>30 pieces</span>
                                  <span style={{ fontWeight: 600, color: '#111' }}>900 × 600 mm</span>
                                </div>
                              </div>
                            </div>
                            <p style={{ marginBottom: '0.3rem', margin: '0 0 0.3rem' }}>• Offset each row by one-third or one-half of flag length.</p>
                            <p style={{ margin: 0 }}>• Avoid grid stacked alignment layouts.</p>
                          </div>
                        )}

                        {/* ── Porcelain Single Size (20 mm) ── */}
                        {isPorcelain && !isBricks && (
                          <div>
                            <p style={{ fontWeight: 700, color: '#111', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Single Size Pack — Stretcher Bond (20 mm Porcelain)
                            </p>
                            <p style={{ marginBottom: '0.8rem', margin: '0 0 0.8rem', fontSize: '0.92rem' }}>
                              Modern linear look. One pack covers approx <strong>{packCoverage} m²</strong>.
                            </p>
                            <div style={{ background: '#f7f4ef', border: '1px solid #e0d9ce', padding: '1rem', marginBottom: '0.8rem', textAlign: 'center' }}>
                              <p style={{ fontWeight: 700, color: '#111', marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>Pack Composition - 38 Pieces (Single Size):</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '280px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #e0d9ce', fontSize: '0.95rem' }}>
                                  <span style={{ color: '#C9A96E', fontWeight: 700 }}>38 pieces</span>
                                  <span style={{ fontWeight: 600, color: '#111' }}>900 × 600 mm</span>
                                </div>
                              </div>
                            </div>
                            <p style={{ marginBottom: '0.3rem', margin: '0 0 0.3rem' }}>• Use 3 mm joint width with external porcelain adhesive.</p>
                            <p style={{ margin: 0 }}>• Sealing not required; clean with pH-neutral soap.</p>
                          </div>
                        )}

                        {/* ── Bricks ── */}
                        {isBricks && (() => {
                          const isMulti = product.slug === 'smeed-dean-yellow-multi';
                          const qtyText = isMulti ? '30 pieces' : '360 bricks';
                          const sizeText = isMulti ? '228-232 × 108-112 × 68-70 mm' : '230 × 110 × 68 mm';
                          const headingText = isMulti 
                            ? 'Smeed Dean Yellow Multi Layout'
                            : `${product.name} Layout`;
                          const descText = isMulti
                            ? 'Consistent modular flags for clean layout.'
                            : 'Traditional stock bricks, restoration partitions.';

                          return (
                            <div>
                              <p style={{ fontWeight: 700, color: '#111', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {headingText}
                              </p>
                              <p style={{ marginBottom: '0.8rem', margin: '0 0 0.8rem', fontSize: '0.92rem' }}>
                                {descText}
                              </p>
                              <div style={{ background: '#f7f4ef', border: '1px solid #e0d9ce', padding: '1rem', marginBottom: '0.8rem', textAlign: 'center' }}>
                                <p style={{ fontWeight: 700, color: '#111', marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>Pack Composition - {qtyText.toUpperCase()} (SINGLE SIZE):</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '280px', margin: '0 auto' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #e0d9ce', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#C9A96E', fontWeight: 700 }}>{qtyText}</span>
                                    <span style={{ fontWeight: 600, color: '#111' }}>{sizeText}</span>
                                  </div>
                                </div>
                              </div>
                              {isMulti ? (
                                <>
                                  <p style={{ marginBottom: '0.4rem', margin: '0 0 0.4rem' }}>• Offset each row by one-third or one-half of length.</p>
                                  <p style={{ margin: 0 }}>• Avoid grid stacked alignment layouts.</p>
                                </>
                              ) : (
                                <>
                                  <p style={{ marginBottom: '0.4rem', margin: '0 0 0.4rem' }}>• Stagger by one-half brick length.</p>
                                  <p style={{ margin: 0 }}>• Maintain proper mortar jointing and level alignments.</p>
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

            {/* Technical Specifications Grid (Right Column) */}
            <div style={{ borderTop: '1px solid #EAE5DC', paddingTop: '1.5rem', marginBottom: '2rem' }}>
              <span style={{ color: '#C9A96E', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em' }}>Architectural Specs</span>
              <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)', fontWeight: 400, marginTop: '0.25rem', color: '#111', marginBottom: '1rem' }}>Technical Specification Profile</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }} className="specs-profile-grid">
                {product?.category === 'Bricks' ? (
                  <>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Classification</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.classification}</p>
                    </div>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Surface Finish</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.finish}</p>
                    </div>
                    {specs.packContents && (
                      <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent', gridColumn: '1 / -1', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pack Contents (Contractor)</span>
                        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.packContents}</p>
                      </div>
                    )}
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent', gridColumn: '1 / -1', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Thickness</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.thickness}</p>
                    </div>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Slip Resistance</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.slip}</p>
                    </div>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Water Absorption</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.absorption}</p>
                    </div>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Compressive Strength</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.compressive}</p>
                    </div>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Frost Durability</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>As per UK norms</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Stone Origin</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.origin}</p>
                    </div>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Classification</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{specs.classification}</p>
                    </div>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Surface Finish</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.finish}</p>
                    </div>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Slip Resistance</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.slip}</p>
                    </div>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Water Absorption</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.absorption}</p>
                    </div>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Compressive Strength</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.compressive}</p>
                    </div>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Thickness</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.thickness}</p>
                    </div>
                    <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                      <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Frost Durability</span>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>As per UK norms</p>
                    </div>
                    {specs.packContents && (
                      <div style={{ border: '1px solid #EAE5DC', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'transparent' }}>
                        <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pack Contents (Contractor)</span>
                        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0.15rem 0 0' }}>{specs.packContents}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .specs-profile-grid > div {
          text-align: center !important;
        }

        /* ---- Similar Products Flex Section ---- */
        .similar-products-section {
          border-top: 1px solid #EAE5DC;
          padding-top: 2.5rem;
          margin-top: 2.5rem;
          width: 100%;
          overflow: hidden;
        }
        .sim-scroll {
          display: flex;
          gap: 1.25rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
          padding-bottom: 0.75rem;
          width: 100%;
        }
        .sim-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .sim-scroll::-webkit-scrollbar-track {
          background: #f1ebd9;
        }
        .sim-scroll::-webkit-scrollbar-thumb {
          background: var(--color-accent);
        }
        .sim-card {
          flex: 0 0 280px;
          width: 280px;
          scroll-snap-align: start;
          text-decoration: none;
          color: inherit;
          background: #fff;
          border: 1px solid #e0d9ce;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          height: 350px;
          overflow: hidden;
        }
        .sim-card:hover {
          transform: translateY(-4px);
        }
        .sim-card-img-wrap {
          width: 100%;
          height: 210px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #F8F5EF;
        }
        .sim-card-img {
          padding: 8px;
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: transform 0.35s ease;
        }
        .sim-card:hover .sim-card-img {
          transform: scale(1.04);
        }
        .sim-card-body {
          padding: 0.9rem 1.1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex-grow: 1;
        }
        .sim-card-name {
          font-size: 0.88rem;
          font-weight: 600;
          line-height: 1.4;
          color: #2a2218;
          margin: 0 0 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 2.8rem;
        }
        .sim-card-price {
          font-size: 1.05rem;
          font-weight: 700;
          color: #8B6914;
          margin: 0;
        }

        /* ---- Detail layout (desktop 2-col using Flexbox) ---- */
        .detail-layout {
          display: flex;
          justify-content: space-between;
          gap: 3.5rem;
          margin-bottom: 4rem;
          align-items: start;
        }
        .detail-layout > div:first-child {
          width: 55%;
          flex-shrink: 0;
          min-width: 0; /* Prevents flex children from stretching the layout */
        }
        .detail-layout > div:last-child {
          width: 41%;
          flex-shrink: 0;
        }
        .main-image-container {
          width: 70%;
          margin: 0 0 1.25rem 0;
          aspect-ratio: 1 / 1;
          border-radius: 20px;
          border: none;
        }
        .thumbnails-container { 
          display: flex;
          gap: 0.85rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          width: 70%;
          margin: 0 0 2.5rem 0;
        }
        .right-column-card {
          position: sticky;
          top: 110px;
        }

        /* ---- Tablet (≤1024px): single column ---- */
        @media (max-width: 1024px) {
          .detail-layout {
            flex-direction: column !important;
            gap: 2.5rem !important;
            margin-bottom: 2rem !important;
          }
          .detail-layout > div:first-child,
          .detail-layout > div:last-child {
            width: 100% !important;
          }
          .calc-desc-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .specs-profile-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1rem !important; }
          .main-image-container {
            width: 100% !important;
            max-width: 500px !important;
            margin: 0 auto 1.5rem auto !important;
            aspect-ratio: 1 / 1 !important;
            height: auto !important;
            max-height: none !important;
            border-radius: 16px !important;
          }
          .thumbnails-container {
            width: 100% !important;
            max-width: 500px !important;
            margin: 0 auto 2rem auto !important;
            justify-content: center !important;
          }
          .right-column-card { position: static !important; top: auto !important; align-self: auto !important; }
        }

        /* ---- Mobile (≤640px) ---- */
        @media (max-width: 640px) {
          .main-image-container {
            max-width: 100% !important;
            margin: 0 0 1rem 0 !important;
          }
          .thumbnails-container {
            margin: 0 0 1.5rem 0 !important;
            justify-content: flex-start !important;
          }
          .thumbnails-container button {
            width: 70px !important;
            height: 70px !important;
          }
          .sim-card {
            flex: 0 0 210px !important;
            width: 210px !important;
            height: 300px !important;
          }
          .sim-card-img-wrap {
            height: 160px !important;
          }
          .sim-card-name {
            font-size: 0.8rem !important;
            height: 2.2rem !important;
          }
        }

        /* ---- Mobile (≤640px): stack buttons full-width ---- */
        @media (max-width: 640px) {
          .checkout-actions-row {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          .checkout-actions-row > button,
          .checkout-actions-row > div {
            width: 100% !important;
            height: 60px !important;
            font-size: 1.05rem !important;
            letter-spacing: 0.1em !important;
            justify-content: center !important;
            border-radius: 30px !important;
          }
          /* Quantity picker — span full width and center content */
          .checkout-actions-row > div {
            border-radius: 30px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          /* Keep the wishlist heart button circular and full-width */
          .checkout-actions-row > button:last-child {
            border-radius: 30px !important;
            width: 100% !important;
          }
        }

        /* ---- Small mobile (≤480px) ---- */
        @media (max-width: 480px) {
          .specs-profile-grid { grid-template-columns: 1fr !important; }
          .calc-inputs { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>

    </div>
  );
}
