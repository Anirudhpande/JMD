import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, X, Phone, Mail, MapPin, Menu, LogOut, MessageSquare } from 'lucide-react';
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
  const [whatsappNumber, setWhatsappNumber] = useState('447450148506');

  // Consent & widgets
  const [cookieConsentAccepted, setCookieConsentAccepted] = useState(() => {
    return !!localStorage.getItem('jmd_cookie_consent');
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('jmd_cart', JSON.stringify(cart));
  }, [cart]);

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
  };

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') {
      navigate('/admin');
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
            <img src="/logo.png" alt="JMD Global Stones Logo" style={{ height: '48px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </Link>

          {/* Navigation Links */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '2.5rem' }}>
            <Link to="/" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-on-light)' }} className="nav-hover-gold">Home</Link>
            <Link to="/products" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-on-light)' }} className="nav-hover-gold">Products</Link>
            <Link to="/delivery" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-on-light)' }} className="nav-hover-gold">Delivery</Link>
            <Link to="/care" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-on-light)' }} className="nav-hover-gold">Care Guide</Link>
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
      <footer style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-muted-on-dark)', borderTop: '1px solid var(--color-accent)', padding: '5rem 0 3rem 0', marginTop: 'auto' }} className="no-print">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr', gap: '3.5rem' }}>
            
            {/* Col 1 */}
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <img src="/logo.png" alt="JMD Global Stones Logo" style={{ height: '48px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-muted-on-dark)', marginBottom: '1.75rem' }}>
                Premium UK supplier of authentic Indian Sandstone, slate, limestone, and porcelain slabs. Sourced directly from our quarries, delivered nationwide.
              </p>
              <p style={{ fontSize: '0.7rem', color: '#5E5A52' }}>
                Company No: 12807959 | VAT: GB 358688337
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h4 style={{ color: 'var(--text-on-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                <li><Link to="/" style={{ color: 'var(--text-muted-on-dark)' }} className="nav-hover-gold">Home</Link></li>
                <li><Link to="/products" style={{ color: 'var(--text-muted-on-dark)' }} className="nav-hover-gold">Paving Slabs</Link></li>
                <li><Link to="/delivery" style={{ color: 'var(--text-muted-on-dark)' }} className="nav-hover-gold">Delivery Guide</Link></li>
                <li><Link to="/care" style={{ color: 'var(--text-muted-on-dark)' }} className="nav-hover-gold">Care & Laying</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 style={{ color: 'var(--text-on-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                Yards & Operations
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted-on-dark)' }}>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <MapPin size={16} style={{ flexShrink: 0, color: 'var(--color-accent)', marginTop: '2px' }} />
                  <div style={{ lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--text-on-dark)' }}>Wirral HQ:</strong> Twelve Quays House, Egerton Wharf, CH41 1LD
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <MapPin size={16} style={{ flexShrink: 0, color: 'var(--color-accent)', marginTop: '2px' }} />
                  <div style={{ lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--text-on-dark)' }}>Southampton Yard:</strong> Yard 2, Eling Wharf, SO40 4TE
                  </div>
                </div>
              </div>
            </div>

            {/* Col 4 */}
            <div>
              <h4 style={{ color: 'var(--text-on-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                Contact Support
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted-on-dark)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Phone size={16} style={{ color: 'var(--color-accent)' }} />
                  <span>07450148506</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Mail size={16} style={{ color: 'var(--color-accent)' }} />
                  <span>sales@jmdglobalstones.co.uk</span>
                </div>
              </div>
            </div>

          </div>

          <div style={{ borderTop: '1px solid #222222', marginTop: '4rem', paddingTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#5E5A52' }}>
            © {new Date().getFullYear()} JMD Global Stones Pvt Ltd. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Style for Grid Responsiveness in Footer */}
      <style>{`
        @media (max-width: 768px) {
          footer div.container div { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
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
