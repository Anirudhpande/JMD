import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, SlidersHorizontal, Check, X, ShieldCheck, Truck, ShoppingBag, Eye } from 'lucide-react';
import { apiFetch } from '../api.js';
import useSEO from '../hooks/useSEO.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]); // Natural Stone, Porcelain, Bricks
  const [sortBy, setSortBy] = useState('popularity'); // popularity, price-asc, price-desc, name-asc

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewActiveImage, setQuickViewActiveImage] = useState(0);

  useSEO({
    title: 'All Paving Products | Indian Sandstone & Vitrified Porcelain',
    description: 'Browse our full range of premium paving — calibrated Indian Sandstone and vitrified Porcelain slabs. Filter by category, price and stock. Fast UK delivery.',
    canonical: 'https://jmdglobalstones.co.uk/products'
  });

  // Load category from URL query parameters if present
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      const categoryMap = {
        'sandstone': 'Sandstone',
        'porcelain': 'Porcelain'
      };
      const catName = categoryMap[urlCategory.toLowerCase()];
      if (catName) {
        setSelectedCategories([catName]);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Explore our extensive catalog of natural sandstone and vitrified porcelain paving slabs. Calibrated flags with fast UK delivery.");
    
    apiFetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  // Filter & Sort Logic
  useEffect(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Filter by Price
    result = result.filter(p => p.price <= maxPrice);

    // Filter by Stock Status
    if (inStockOnly) {
      result = result.filter(p => (p.stock || 0) > 0);
    }

    // Filter by Material Type
    if (selectedTypes.length > 0) {
      result = result.filter(p => {
        let type = 'Natural Stone';
        if (p.category === 'Porcelain') type = 'Porcelain';
        if (p.category === 'Bricks') type = 'Bricks';
        return selectedTypes.includes(type);
      });
    }

    // Custom sort configuration for sequential layout
    const categoryOrder = { 'Sandstone': 1, 'Porcelain': 2 };

    const sandstoneMaterialOrder = {
      'raj green': 1,
      'kandla grey': 2,
      'rippon buff': 3,
      'autumn brown': 4
    };

    const porcelainMaterialOrder = {
      'county anthracite': 1,
      'hammer stone grey': 2,
      'mountain white': 3,
      'earth core grey': 4,
      'quartz light grey': 5,
      'kandla grey': 6,
      'quartz white': 7,
      'persia beige': 8
    };

    const getSequenceValue = (p) => {
      const catVal = categoryOrder[p.category] || 99;
      const nameLower = p.name.toLowerCase();
      let matVal = 99;

      if (p.category === 'Sandstone') {
        for (const [key, val] of Object.entries(sandstoneMaterialOrder)) {
          if (nameLower.includes(key)) { matVal = val; break; }
        }
      } else if (p.category === 'Porcelain') {
        for (const [key, val] of Object.entries(porcelainMaterialOrder)) {
          if (nameLower.includes(key)) { matVal = val; break; }
        }
      }

      const sizeLower = p.size.toLowerCase();
      let sizeVal = 3;
      if (sizeLower.includes('project pack') || sizeLower.includes('mixed') || sizeLower.includes('18.9m2')) {
        sizeVal = 1;
      } else if (sizeLower.includes('900x600')) {
        sizeVal = 2;
      }

      // Combine into a sort key index
      return catVal * 1000 + matVal * 10 + sizeVal;
    };

    // Sorting
    if (sortBy === 'popularity') {
      result.sort((a, b) => getSequenceValue(a) - getSequenceValue(b));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(result);
  }, [products, selectedCategories, maxPrice, inStockOnly, selectedTypes, sortBy]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const checkProductInStock = (prod) => {
    return (prod.stock || 0) > 0;
  };

  // Helper for technical specifications on catalog cards
  const getCardSpecs = (category) => {
    switch (category) {
      case 'Sandstone': return 'Rajasthan • R11 Slip • Calibrated';
      case 'Porcelain': return 'Vitrified • Frost Proof • R11';
      default: return 'Premium Calibrated Paving';
    }
  };

  const handleOpenQuickView = (e, prod) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(prod);
    setQuickViewActiveImage(0);
  };

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
    <div style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh', padding: '2.5rem 0 6rem 0' }}>
      <div className="container">
        
        {/* Page Title */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '2rem' }}>
          <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', fontWeight: 400, color: 'var(--text-on-light)' }}>
            Premium Architectural Materials
          </h1>
          <p style={{ color: 'var(--text-muted-on-light)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Showing {filteredProducts.length} curated paving materials
          </p>
        </div>

        {/* Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3.5rem' }} className="catalog-layout">
          
          {/* Sidebar Filters */}
          <aside style={{ border: '1px solid var(--color-border-light)', padding: '2.5rem 2rem', height: 'fit-content', backgroundColor: 'transparent', position: 'sticky', top: '115px', alignSelf: 'start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.25rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1rem' }}>
              <SlidersHorizontal size={16} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 600 }}>Filter Slabs</h3>
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', fontWeight: 600 }}>Category</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['Sandstone', 'Porcelain', 'Bricks'].map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => toggleCategory(cat)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: selectedCategories.includes(cat) ? 'var(--text-on-light)' : 'var(--text-muted-on-light)', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ width: '16px', height: '16px', border: '1px solid var(--color-border-light)', backgroundColor: selectedCategories.includes(cat) ? 'var(--color-accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111111' }}>
                      {selectedCategories.includes(cat) && <Check size={11} strokeWidth={2.5} />}
                    </div>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Stone Type Filter */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', fontWeight: 600 }}>Material Type</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['Natural Stone', 'Porcelain', 'Bricks'].map((type) => (
                  <button 
                    key={type} 
                    onClick={() => toggleType(type)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: selectedTypes.includes(type) ? 'var(--text-on-light)' : 'var(--text-muted-on-light)', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ width: '16px', height: '16px', border: '1px solid var(--color-border-light)', backgroundColor: selectedTypes.includes(type) ? 'var(--color-accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111111' }}>
                      {selectedTypes.includes(type) && <Check size={11} strokeWidth={2.5} />}
                    </div>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>Max Price</span>
                <span style={{ color: 'var(--color-accent)' }}>£{maxPrice}</span>
              </h4>
              <input 
                type="range" 
                min="200" 
                max="500" 
                step="10"
                value={maxPrice} 
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer', backgroundColor: 'var(--color-border-light)', height: '2px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted-on-light)', marginTop: '0.5rem' }}>
                <span>£200</span>
                <span>£500</span>
              </div>
            </div>

            {/* In Stock Filter */}
            <div>
              <button 
                onClick={() => setInStockOnly(!inStockOnly)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: inStockOnly ? 'var(--text-on-light)' : 'var(--text-muted-on-light)', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: '16px', height: '16px', border: '1px solid var(--color-border-light)', backgroundColor: inStockOnly ? 'var(--color-accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111111' }}>
                  {inStockOnly && <Check size={11} strokeWidth={2.5} />}
                </div>
                In Stock Only
              </button>
            </div>

          </aside>

          {/* Catalog Listing */}
          <div>
            
            {/* Sort Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center', marginBottom: '2.5rem', padding: '1rem 1.5rem', border: '1px solid var(--color-border-light)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort By:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ border: '1px solid var(--color-border-light)', padding: '0.5rem 2rem 0.5rem 0.75rem', backgroundColor: 'transparent', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
              >
                <option value="popularity">Popularity / Stars</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* Product Grid - Asymmetric Layout styling */}
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '7rem 0', border: '1px solid var(--color-border-light)', backgroundColor: 'transparent' }}>
                <p style={{ color: 'var(--text-muted-on-light)', fontSize: '1rem', marginBottom: '2rem' }}>No materials match your filter combination.</p>
                <button 
                  onClick={() => {
                    setSelectedCategories([]);
                    setMaxPrice(500);
                    setInStockOnly(false);
                    setSelectedTypes([]);
                  }}
                  className="btn btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="catalog-grid">
                {filteredProducts.map((prod, index) => {
                  const inStock = checkProductInStock(prod);
                  // Render featured products as wide, double-column highlighted cards (e.g. index 1 or 5)
                  const isHighlighted = prod.is_featured && (index % 4 === 1);
                  
                  if (isHighlighted) {
                    return (
                      <div key={prod.id} className={`product-card ${prod.category === 'Bricks' ? 'no-hover-swap' : ''} asymmetric-highlight`}>
                        <Link to={`/products/${prod.slug}`} style={{ height: '100%' }}>
                          <div className="product-image-wrapper">
                            <img src={prod.images[0]} alt={prod.name} className="product-image-primary" loading="lazy" decoding="async" />
                            {prod.category !== 'Bricks' && (
                              <img src={prod.images[1] || prod.images[0]} alt={`${prod.name} alternate view`} className="product-image-secondary" loading="lazy" decoding="async" />
                            )}
                            {!inStock && <span className="badge badge-out-of-stock" style={{ backgroundColor: 'var(--color-danger)' }}>Out of Stock</span>}
                            {inStock && <span className="badge badge-featured">Spotlight Paving</span>}
                          </div>
                        </Link>
                        <div className="product-info" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span className="product-cat">{prod.category} Collection</span>
                          <Link to={`/products/${prod.slug}`}>
                            <h3 className="product-title" style={{ fontSize: '1.8rem', marginBottom: '0.75rem', lineHeight: 1.15 }}>{prod.name}</h3>
                          </Link>
                          <div className="product-rating">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={13} fill={i < Math.floor(prod.stars) ? 'currentColor' : 'none'} style={{ strokeWidth: 1.5 }} />
                            ))}
                            <span style={{ color: 'var(--text-muted-on-light)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>{prod.stars}</span>
                          </div>
                          
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-on-light)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                            {prod.description.substring(0, 110)}...
                          </p>

                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)', fontWeight: 600, marginBottom: '1.5rem' }}>
                            {getCardSpecs(prod.category)}
                          </div>

                          <div className="product-price" style={{ fontSize: '1.6rem', marginBottom: '1.5rem', marginTop: 0 }}>
                            £{prod.price.toFixed(2)} <span style={{ color: 'var(--text-muted-on-light)' }}>ex. VAT</span>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Link to={`/products/${prod.slug}`} className="btn btn-primary" style={{ flexGrow: 1, fontSize: '0.75rem', padding: '0.85rem 1rem', letterSpacing: '0.1em' }}>
                              View Details
                            </Link>
                            <button onClick={(e) => handleOpenQuickView(e, prod)} className="btn btn-secondary" style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Quick View">
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={prod.id} className={`product-card ${prod.category === 'Bricks' ? 'no-hover-swap' : ''}`}>
                      <Link to={`/products/${prod.slug}`}>
                        <div className="product-image-wrapper">
                          <img src={prod.images[0]} alt={prod.name} className="product-image-primary" loading="lazy" decoding="async" />
                          {prod.category !== 'Bricks' && (
                            <img src={prod.images[1] || prod.images[0]} alt={`${prod.name} alternate view`} className="product-image-secondary" loading="lazy" decoding="async" />
                          )}
                          {!inStock && <span className="badge badge-out-of-stock" style={{ backgroundColor: 'var(--color-danger)' }}>Out of Stock</span>}
                          {prod.is_featured && inStock && <span className="badge badge-featured">Featured selection</span>}
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
                        
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted-on-light)', marginBottom: '1rem' }}>
                          {getCardSpecs(prod.category)}
                        </div>

                        <div className="product-price" style={{ marginBottom: '1.25rem' }}>
                          £{prod.price.toFixed(2)} <span style={{ color: 'var(--text-muted-on-light)' }}>ex. VAT</span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/products/${prod.slug}`} className="btn btn-primary" style={{ flexGrow: 1, fontSize: '0.75rem', letterSpacing: '0.1em', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                            View Details
                          </Link>
                          <button onClick={(e) => handleOpenQuickView(e, prod)} className="btn btn-secondary" style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Quick View">
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Slide-out Quick View Drawer */}
      {quickViewProduct && (
        <div className="quickview-overlay" onClick={() => setQuickViewProduct(null)}>
          <div className="quickview-drawer" onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div style={{ padding: '1.75rem', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.3rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-heading)' }}>Quick Material View</h3>
              <button onClick={() => setQuickViewProduct(null)} style={{ cursor: 'pointer', color: 'var(--text-on-light)' }} className="nav-hover-gold">
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '2rem' }}>
              
              {/* Media Carousel */}
              <div style={{ width: '100%', aspectRatio: '1.3', border: '1px solid var(--color-border-light)', backgroundColor: '#EBE4D9', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <img src={quickViewProduct.images[quickViewActiveImage]} alt={quickViewProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Thumbnails */}
              {quickViewProduct.images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
                  {quickViewProduct.images.map((img, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setQuickViewActiveImage(idx)}
                      style={{ width: '60px', height: '60px', border: quickViewActiveImage === idx ? '1px solid var(--color-accent)' : '1px solid var(--color-border-light)', cursor: 'pointer' }}
                    >
                      <img src={img} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Details */}
              <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em' }}>{quickViewProduct.category}</span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginTop: '0.5rem', marginBottom: '1rem', fontWeight: 400 }}>{quickViewProduct.name}</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-accent)', marginBottom: '1.5rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(quickViewProduct.stars) ? 'currentColor' : 'none'} style={{ strokeWidth: 1.5 }} />
                ))}
                <span style={{ color: 'var(--text-muted-on-light)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>({quickViewProduct.stars} review score)</span>
              </div>

              <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                {quickViewProduct.description}
              </p>

              {/* Technical Specifications */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.25rem', border: '1px solid var(--color-border-light)', backgroundColor: '#EBE4D9', fontSize: '0.8rem', marginBottom: '2rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted-on-light)' }}>Stone origin:</span>
                  <p style={{ fontWeight: 600 }}>{quickViewProduct.category === 'Porcelain' ? 'Italy / Spain' : 'Rajasthan, India'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted-on-light)' }}>Slip resistance:</span>
                  <p style={{ fontWeight: 600 }}>R11 (High-Grip)</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted-on-light)' }}>Frost resistance:</span>
                  <p style={{ fontWeight: 600 }}>Fully Resistant</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted-on-light)' }}>Thickness parameters:</span>
                  <p style={{ fontWeight: 600 }}>{quickViewProduct.category === 'Porcelain' ? '20mm Vitrified' : '22mm Calibrated'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ fontSize: '1.8rem', color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}>
                  £{quickViewProduct.price.toFixed(2)}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted-on-light)', marginLeft: '0.5rem' }}>ex. VAT</span>
                </div>
                
                <Link to={`/products/${quickViewProduct.slug}`} className="btn btn-primary" style={{ flexGrow: 1, fontSize: '0.75rem', letterSpacing: '0.1em', textAlign: 'center' }} onClick={() => setQuickViewProduct(null)}>
                  View Full Details
                </Link>
              </div>

            </div>

          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .catalog-layout { grid-template-columns: 1fr !important; }
          .catalog-layout aside { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
