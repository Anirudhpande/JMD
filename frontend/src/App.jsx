import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, X, Phone, Mail, MapPin, Menu, LogOut, MessageSquare, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { supabase } from './supabase.js';
import { apiFetch } from './api.js';

// Import Pages
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Delivery from './pages/Delivery.jsx';
import Care from './pages/Care.jsx';
import Contact from './pages/Contact.jsx';
import Blog from './pages/Blog.jsx';
import Auth from './pages/Auth.jsx';
import Account from './pages/Account.jsx';
import Admin from './pages/Admin.jsx';
import Checkout from './pages/Checkout.jsx';
import Invoice from './pages/Invoice.jsx';
import NotFound from './pages/NotFound.jsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_stripe_key_12345');

function AppContent() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('jmd_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('jmd_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Shipping & settings
  const [shippingZones, setShippingZones] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState('447458148586');

  // Consent & widgets
  const [cookieConsentAccepted, setCookieConsentAccepted] = useState(() => {
    return !!localStorage.getItem('jmd_cookie_consent');
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('jmd_cart', JSON.stringify(cart));

    // Save cart to backend for abandoned cart tracking (only for logged-in users with items)
    if (user && user.email && cart.length > 0) {
      const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const timer = setTimeout(() => {
        apiFetch('/api/save-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            user_email: user.email,
            user_name: user.name,
            cart_items: cart,
            cart_total: cartTotal
          })
        }).catch(() => {});
      }, 3000); // debounce 3s to avoid hammering on rapid adds
      return () => clearTimeout(timer);
    }
  }, [cart, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('jmd_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jmd_user');
    }
  }, [user]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Load shipping zones and site settings on startup
  useEffect(() => {
    apiFetch('/api/shipping-zones')
      .then(res => res.json())
      .then(data => setShippingZones(data))
      .catch(err => console.error('Error fetching shipping zones:', err));

    apiFetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.whatsapp_number) {
          setWhatsappNumber(data.whatsapp_number);
        }
      })
      .catch(err => console.error('Error fetching site settings:', err));
  }, []);

  // Listen to Supabase Auth state changes
  useEffect(() => {
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          const userObj = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            phone: session.user.phone || '',
            role: 'customer'
          };
          try {
            const res = await apiFetch(`/api/profiles/${session.user.id}`);
            if (res.ok) {
              const profile = await res.json();
              setUser(profile);
            } else {
              const upsertRes = await apiFetch('/api/profiles/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userObj)
              });
              if (upsertRes.ok) {
                const profile = await upsertRes.json();
                setUser(profile);
              } else {
                setUser(userObj);
              }
            }
          } catch (err) {
            console.error("Auth state fetch error:", err);
            setUser(userObj);
          }
        } else {
          // Only clear if logged out explicitly or invalid session
          if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  // Cart operations
  const addToCart = (product, variantSize, quantity, price) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.product_id === product.id && item.variant_size === variantSize
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }

      return [...prevCart, {
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        product_image: product.images[0],
        variant_size: variantSize,
        price: price,
        quantity: quantity
      }];
    });

    // Log cart addition activity (fire and forget)
    const savedUser = localStorage.getItem('jmd_user');
    const u = savedUser ? JSON.parse(savedUser) : null;
    apiFetch('/api/activity-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'cart_addition',
        description: `${u?.name || 'Guest'} added ${quantity}x "${product.name}" to basket`,
        user_name: u?.name || null,
        user_email: u?.email || null,
        meta: { product_id: product.id, product_name: product.name, quantity, price }
      })
    }).catch(() => {});

    navigate('/cart');
  };

  const removeFromCart = (index) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index, delta) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      const newQty = newCart[index].quantity + delta;
      if (newQty <= 0) {
        return prevCart.filter((_, i) => i !== index);
      }
      newCart[index].quantity = newQty;
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    // Remove abandoned cart record so we don't send a reminder after order is placed
    if (user && user.email) {
      apiFetch('/api/save-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user.email,
          cart_items: [],   // empty cart — server ignores empty carts
          cart_total: 0
        })
      }).catch(() => {});
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect');
    
    if (userData.role === 'admin') {
      navigate('/admin');
    } else if (redirectUrl) {
      navigate(redirectUrl);
    } else {
      navigate('/account');
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('jmd_user');
    navigate('/');
  };

  const handleAcceptCookies = () => {
    localStorage.setItem('jmd_cookie_consent', 'true');
    setCookieConsentAccepted(true);
  };

  return (
    <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-light)' }}>
      
      {/* Top Banner - Deep Charcoal */}
      <div style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', textAlign: 'center', padding: '0.6rem 1rem', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border-dark)', fontWeight: 500 }}>
        100% Genuine Stones of Best Quality available to Retail Users.
      </div>

      {/* Header - Warm Off-White */}
      <header style={{ backgroundColor: 'var(--bg-light)', borderBottom: '1px solid var(--color-border-light)', position: 'sticky', top: 0, zIndex: 100 }} className="no-print">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '90px' }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="JMD Global Stones Logo" style={{ height: '64px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </Link>

          {/* Navigation Links */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '2.5rem' }}>
            <Link to="/" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-on-light)' }} className="nav-hover-gold">Home</Link>
            <Link to="/products" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-on-light)' }} className="nav-hover-gold">Products</Link>
            <Link to="/delivery" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-on-light)' }} className="nav-hover-gold">Delivery</Link>
            <Link to="/care" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-on-light)' }} className="nav-hover-gold">Care Guide</Link>
            <Link to="/blog" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-on-light)' }} className="nav-hover-gold">Blog</Link>
            <Link to="/contact" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-on-light)' }} className="nav-hover-gold">Contact</Link>
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to={user.role === 'admin' ? '/admin' : '/account'} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }} className="nav-hover-gold">
                  <User size={18} />
                  <span className="desktop-nav">{user.name.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-on-light)' }} title="Logout" className="nav-hover-gold">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" title="Login / Register" className="nav-hover-gold" style={{ color: 'var(--text-on-light)' }}>
                <User size={20} />
              </Link>
            )}

            <button onClick={() => navigate('/cart')} style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-on-light)' }} title="Shopping Cart" className="nav-hover-gold">
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-8px', backgroundColor: 'var(--color-accent)', color: '#111111', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', cursor: 'pointer', color: 'var(--text-on-light)' }}>
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{ backgroundColor: 'var(--bg-light)', borderTop: '1px solid var(--color-border-light)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', fontWeight: 600 }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)}>Products</Link>
              <Link to="/delivery" onClick={() => setMobileMenuOpen(false)}>Delivery Guide</Link>
              <Link to="/care" onClick={() => setMobileMenuOpen(false)}>Care & Maintenance</Link>
              <Link to="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
            </div>
          </div>
        )}
      </header>

      {/* Style for Responsive Header and hover */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-toggle { display: block !important; }
        }
        .nav-hover-gold:hover {
          color: var(--color-accent) !important;
        }
      `}</style>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail addToCart={addToCart} />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/care" element={<Care />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/cart" element={<Checkout cart={cart} removeFromCart={removeFromCart} updateCartQuantity={updateCartQuantity} clearCart={clearCart} shippingZones={shippingZones} />} />
          <Route path="/invoice/:orderId" element={<Invoice />} />
          <Route path="/login" element={<Auth user={user} onLogin={handleLogin} />} />
          
          <Route path="/account" element={
            user && user.role !== 'admin' ? (
              <Account user={user} onLogout={handleLogout} />
            ) : (
              <Auth user={user} onLogin={handleLogin} />
            )
          } />

          <Route path="/admin" element={
            user && user.role === 'admin' ? (
              <Admin user={user} onLogout={handleLogout} />
            ) : (
              <Auth user={user} onLogin={handleLogin} />
            )
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer - Deep Charcoal with thin gold top border */}
      <footer style={{ backgroundColor: '#2E3033', color: 'rgba(255,255,255,0.75)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '3rem 0 2rem 0', marginTop: 'auto' }} className="no-print">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 1.2fr 1.5fr', gap: '2rem' }} className="footer-grid">
            
            {/* Col 1: Logo & Tagline */}
            <div>
              <div style={{ 
                backgroundColor: '#ffffff', 
                padding: '0.75rem 1.25rem', 
                borderRadius: '8px', 
                display: 'inline-block',
                marginBottom: '1.25rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                <img src="/logo.png" alt="JMD Global Stones Logo" style={{ height: '42px', objectFit: 'contain', display: 'block' }} />
              </div>
              <h5 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>JMD GLOBAL STONES PVT LTD</h5>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
                UK Supplier of Indian Sandstone, Porcelain Paving, Slate, Limestone Patio Slabs with Nationwide Delivery.
              </p>
            </div>

            {/* Col 2: Menu */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Menu
              </h4>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.85rem' }}>
                <Link to="/" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.85rem', textDecoration: 'none' }} className="nav-hover-gold">Home</Link>
                <Link to="/products" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.85rem', textDecoration: 'none' }} className="nav-hover-gold">Products</Link>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                <li><Link to="/delivery" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }} className="nav-hover-gold">Delivery</Link></li>
                <li><Link to="/Care" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }} className="nav-hover-gold">care guide</Link></li>
                <li><Link to="/contact" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }} className="nav-hover-gold">contact</Link></li>
              </ul>
            </div>

            {/* Col 3: Company Details */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Company Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
                <div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>Company Number</p>
                  <p style={{ color: '#fff', fontWeight: 600, margin: 0 }}>12807959</p>
                </div>
                <div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>VAT Number</p>
                  <p style={{ color: '#fff', fontWeight: 600, margin: 0 }}>GB 358688337</p>
                </div>
              </div>
            </div>

            {/* Col 4: Contact Us */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contact Us
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  <a href="mailto:sales@jmdglobalstones.co.uk" style={{ color: 'inherit', textDecoration: 'none' }} className="nav-hover-gold">sales@jmdglobalstones.co.uk</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Phone size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  <a href="tel:07458148586" style={{ color: 'inherit', textDecoration: 'none' }} className="nav-hover-gold">07458148586 (Roopesh Kapur)</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <MapPin size={16} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ lineHeight: 1.45 }}>70 Grange Road East, Wirral, United Kingdom, CH41 5FE</span>
                </div>
              </div>
              
              {/* Social Media Row */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                
              </div>
            </div>

          </div>

          {/* Bottom copyright row */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '2rem', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }} className="footer-bottom">
            <span>copyright {new Date().getFullYear()} | JMD GLOBAL STONES PVT LTD</span>
          </div>
        </div>
      </footer>

      {/* Style for Grid Responsiveness in Footer */}
      <style>{`
        .footer-social-icon {
          transition: all 0.3s ease !important;
        }
        .footer-social-icon:hover {
          background-color: var(--color-accent) !important;
          color: #fff !important;
          transform: translateY(-2px);
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 2.5rem !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-bottom { flexDirection: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Floating green WhatsApp widget with hover tooltip */}
      <a 
        href={`https://wa.me/${whatsappNumber}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-widget" 
        title="WhatsApp Support"
      >
        <MessageSquare size={26} />
        <span className="whatsapp-tooltip">Chat with Roopesh</span>
      </a>

      {/* Cookie Consent Banner */}
      {!cookieConsentAccepted && (
        <div className="cookie-consent-banner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-on-dark)' }}>Cookie Policy & Security</h4>
            <button onClick={handleAcceptCookies} style={{ cursor: 'pointer', color: 'var(--text-on-dark)' }}><X size={16} /></button>
          </div>
          <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-muted-on-dark)' }}>
            We use cookies to analyze web traffic, optimize quarry stock listings, and verify secure Stripe payments. By browsing, you accept our standard cookie settings.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
            <button onClick={handleAcceptCookies} className="btn btn-accent" style={{ fontSize: '0.7rem', padding: '0.5rem 1rem', flexGrow: 1 }}>Accept Cookies</button>
            <button onClick={handleAcceptCookies} className="btn" style={{ fontSize: '0.7rem', padding: '0.5rem 1rem', color: 'var(--text-on-dark)', borderColor: 'var(--color-border-dark)' }}>Decline</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <Elements stripe={stripePromise}>
      <AppContent />
    </Elements>
  );
}
