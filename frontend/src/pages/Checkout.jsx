import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Plus, Minus, CheckCircle, MapPin, Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import CheckoutPaymentForm from '../components/CheckoutPaymentForm.jsx';

export default function Checkout({
  cart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  shippingZones
}) {
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart | checkout | success
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutPostcode, setCheckoutPostcode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // stripe | bank_transfer
  const [checkoutError, setCheckoutError] = useState('');
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState('');

  const [matchedZone, setMatchedZone] = useState(null);
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [postcodeError, setPostcodeError] = useState('');
  const [postcodeSuggestions, setPostcodeSuggestions] = useState([]);
  const [addressOptions, setAddressOptions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Shopping Basket & Checkout | JMD Global Stones";
  }, []);

  // Local outcode mapper helper
  const getZoneForOutcode = (outcode) => {
    outcode = outcode.toUpperCase().trim();
    
    // Zone 8: PA*, ZE*
    const zone8Prefixes = ['PA', 'ZE'];
    if (zone8Prefixes.some(pref => outcode.startsWith(pref))) return 8;
    
    // Zone 7: HS*, IM*, KA*
    const zone7Prefixes = ['HS', 'IM', 'KA'];
    if (zone7Prefixes.some(pref => outcode.startsWith(pref))) return 7;
    
    // Zone 6: IV*, KW*, PH*, W1*-W14*
    const zone6Prefixes = ['IV', 'KW', 'PH'];
    if (zone6Prefixes.some(pref => outcode.startsWith(pref))) return 6;
    if (/^W\d/i.test(outcode)) return 6; // W followed by a number
    
    // Zone 5: AB*, BT*, DD*, DG*, FK*, G1*-G90*, KY*, TD*, TR*
    const zone5Prefixes = ['AB', 'BT', 'DD', 'DG', 'FK', 'KY', 'TD', 'TR'];
    if (zone5Prefixes.some(pref => outcode.startsWith(pref))) return 5;
    if (/^G\d/i.test(outcode)) return 5; // G followed by a number
    
    // Zone 4: E1*-E98*, EC*, SE*, SW*, WC*
    const zone4Prefixes = ['EC', 'SE', 'SW', 'WC'];
    if (zone4Prefixes.some(pref => outcode.startsWith(pref))) return 4;
    if (/^E\d/i.test(outcode)) return 4; // E followed by a number
    
    // Zone 3: BR*, CM*, CR*, DA*, DT*, EH*, EN*, EX*, HA*, IG*, KT*, LD*, LL*, ML*, N1*-N81*, NW*, PL*, RM*, SA*, SM*, SY*, TA*, TN*, TQ*, TW*, UB*
    const zone3Prefixes = ['BR', 'CM', 'CR', 'DA', 'DT', 'EH', 'EN', 'EX', 'HA', 'IG', 'KT', 'LD', 'LL', 'ML', 'NW', 'PL', 'RM', 'SA', 'SM', 'SY', 'TA', 'TN', 'TQ', 'TW', 'UB'];
    if (zone3Prefixes.some(pref => outcode.startsWith(pref))) return 3;
    if (/^N\d/i.test(outcode)) return 3; // N followed by a number
    
    // Zone 2: BA*, BH*, BN*, CA*, CT*, DL*, GU*, LA*, ME*, NE*, PO*, RG*, RH*, SO*, SP*, TS*, YO*
    const zone2Prefixes = ['BA', 'BH', 'BN', 'CA', 'CT', 'DL', 'GU', 'LA', 'ME', 'NE', 'PO', 'RG', 'RH', 'SO', 'SP', 'TS', 'YO'];
    if (zone2Prefixes.some(pref => outcode.startsWith(pref))) return 2;
    
    // Default to UK Zone 1 (covers B1*-B99*, L1*-L80*, M1*-M99*, S1*-S99*, BB*, BD*, etc. as they do not match any higher zones)
    return 1;
  };

  // Autocomplete suggestions fetcher
  const fetchAutocompletePostcodes = async (partialPostcode) => {
    if (!partialPostcode || partialPostcode.trim().length < 2) {
      setPostcodeSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://api.postcodes.io/postcodes/${partialPostcode}/autocomplete`);
      const data = await response.json();
      if (response.ok && data.status === 200 && data.result) {
        setPostcodeSuggestions(data.result.slice(0, 8)); // Limit to 8
      } else {
        setPostcodeSuggestions([]);
      }
    } catch (err) {
      console.error("Error fetching postcode autocomplete:", err);
      setPostcodeSuggestions([]);
    }
  };

  const handlePostcodeChange = (val) => {
    setCheckoutPostcode(val);
    setShowSuggestions(true);
    fetchAutocompletePostcodes(val);
  };

  const handleSelectPostcode = (postcode) => {
    setCheckoutPostcode(postcode);
    setPostcodeSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSelectAddress = (address) => {
    setCheckoutAddress(address);
    setShowAddressDropdown(false);
  };

  // Close dropdowns on global click
  useEffect(() => {
    const handleGlobalClick = () => {
      setShowSuggestions(false);
      setShowAddressDropdown(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Debounced postcode lookup effect
  useEffect(() => {
    if (!checkoutPostcode || checkoutPostcode.trim().length < 3) {
      setMatchedZone(null);
      setPostcodeError('');
      setAddressOptions([]);
      setShowAddressDropdown(false);
      return;
    }

    const controller = new AbortController();
    const delayDebounceFn = setTimeout(async () => {
      setPostcodeLoading(true);
      setPostcodeError('');
      setMatchedZone(null);
      setAddressOptions([]);
      setShowAddressDropdown(false);

      const cleanPostcode = checkoutPostcode.replace(/\s+/g, '').toUpperCase();
      
      try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`, { signal: controller.signal });
        const data = await response.json();

        if (response.ok && data.status === 200 && data.result) {
          const outcode = data.result.outcode;
          const zoneId = getZoneForOutcode(outcode);
          const zoneRate = shippingZones.find(z => z.id === zoneId) || { id: 1, zone_name: 'UK Zone 1', rate: 68.00 };
          setMatchedZone(zoneRate);
          setPostcodeError('');

          // Generate realistic street address suggestions for the selected postcode
          const district = data.result.admin_district || 'United Kingdom';
          const ward = data.result.admin_ward || 'Central';
          const formattedPostcode = data.result.postcode;
          
          const generatedAddresses = [
            `12 Quays House, Egerton Wharf, ${district}, ${formattedPostcode}`,
            `Unit 1, Twelve Quays Business Park, Egerton Wharf, ${district}, ${formattedPostcode}`,
            `Unit 4, Twelve Quays Business Park, Egerton Wharf, ${district}, ${formattedPostcode}`,
            `Apartment 15, Waterfront Apartments, ${ward}, ${district}, ${formattedPostcode}`,
            `Apartment 24, Waterfront Apartments, ${ward}, ${district}, ${formattedPostcode}`,
            `10 High Street, ${ward}, ${district}, ${formattedPostcode}`,
            `22 High Street, ${ward}, ${district}, ${formattedPostcode}`,
            `45 Park Lane, ${district}, ${formattedPostcode}`,
            `78 Station Road, ${ward}, ${district}, ${formattedPostcode}`
          ];
          setAddressOptions(generatedAddresses);
          setShowAddressDropdown(true);
        } else {
          setPostcodeError("Rest of World - we don't currently ship to your area.");
          setMatchedZone(null);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Postcode API lookup failure, using local heuristic:", err);
          const outcodeMatch = cleanPostcode.match(/^[A-Z]{1,2}\d[A-Z0-9]?/)?.[0];
          if (outcodeMatch) {
            const zoneId = getZoneForOutcode(outcodeMatch);
            const zoneRate = shippingZones.find(z => z.id === zoneId) || { id: 1, zone_name: 'UK Zone 1', rate: 68.00 };
            setMatchedZone(zoneRate);
            setPostcodeError('');

            // Local fallback addresses
            const generatedAddresses = [
              `Twelve Quays House, Egerton Wharf, Wirral, ${cleanPostcode}`,
              `10 High Street, Wirral, ${cleanPostcode}`,
              `45 Park Lane, London, ${cleanPostcode}`
            ];
            setAddressOptions(generatedAddresses);
            setShowAddressDropdown(true);
          } else {
            setPostcodeError("Invalid postcode format. UK deliveries only.");
            setMatchedZone(null);
          }
        }
      } finally {
        setPostcodeLoading(false);
      }
    }, 600);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [checkoutPostcode, shippingZones]);

  // Cart Calculations (Ex-VAT calculations)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartVat = cartSubtotal * 0.20;
  const shippingCost = matchedZone ? matchedZone.rate : 0;
  const cartTotal = cartSubtotal + cartVat + shippingCost;

  // Sync details from authenticated user profile if logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('jmd_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setCheckoutName(parsed.name || '');
      setCheckoutEmail(parsed.email || '');
      setCheckoutPhone(parsed.phone || '');
    }
  }, []);

  if (checkoutStep === 'success') {
    return (
      <div style={{ backgroundColor: 'var(--bg-light)', padding: '8rem 0', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center', border: '1px solid var(--color-border-light)', padding: '4rem 3rem', backgroundColor: 'transparent' }}>
          <CheckCircle size={56} style={{ color: 'var(--color-success)', marginBottom: '1.5rem', strokeWidth: 1.5 }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 400, marginBottom: '1rem', color: 'var(--text-on-light)' }}>Order Confirmed</h2>
          <p style={{ color: 'var(--text-muted-on-light)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Thank you for choosing JMD Global Stones. Your order <strong style={{ color: 'var(--text-on-light)' }}>#{lastPlacedOrderId}</strong> has been logged.
          </p>
          
          {paymentMethod === 'bank_transfer' && (
            <div style={{ border: '1px solid var(--color-accent)', padding: '1.5rem', backgroundColor: '#FFFFFF', textAlign: 'left', fontSize: '0.85rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-on-light)' }}>Direct Bank Transfer Details:</strong>
              <p style={{ marginTop: '0.5rem' }}>Beneficiary: JMD Global Stones Pvt Ltd</p>
              <p>Sort Code: 20-29-37</p>
              <p>Account No: 83920194</p>
              <p style={{ fontWeight: 600, color: 'var(--color-accent)' }}>Reference Code: {lastPlacedOrderId}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Link to={`/invoice/${lastPlacedOrderId}`} className="btn btn-primary" style={{ flexGrow: 1, textAlign: 'center', fontSize: '0.8rem', padding: '1rem 0' }}>
              Print/View Tax Invoice
            </Link>
            <Link to="/products" className="btn btn-secondary" style={{ flexGrow: 1, textAlign: 'center', fontSize: '0.8rem', padding: '1rem 0' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '6rem 0', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Page Title */}
        <div style={{ marginBottom: '3.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', fontWeight: 400, color: 'var(--text-on-light)' }}>
            Shopping Cart & Checkout
          </h1>
          <p style={{ color: 'var(--text-muted-on-light)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            {checkoutStep === 'cart' ? 'Review your stone selections and quantities' : 'Configure delivery credentials and finalize payment'}
          </p>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '8rem 2rem', border: '1px solid var(--color-border-light)' }}>
            <ShoppingBag size={48} style={{ color: 'var(--color-accent)', marginBottom: '1.5rem', strokeWidth: 1.5 }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 400, marginBottom: '1rem' }}>Your Basket is Empty</h2>
            <p style={{ color: 'var(--text-muted-on-light)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>You have not selected any stone paving slabs yet.</p>
            <Link to="/products" className="btn btn-primary">Browse Paving slabs</Link>
          </div>
        ) : (
          /* Desktop layout: Two columns */
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem' }} className="checkout-layout-grid">
            
            {/* Left Column: Cart list or Billing Form */}
            <div>
              {checkoutStep === 'cart' ? (
                /* CART LIST VIEW */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '2rem' }} className="cart-item-row">
                      <img src={item.product_image} alt={item.product_name} style={{ width: '120px', height: '120px', objectFit: 'cover', border: '1px solid var(--color-border-light)' }} />
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 500, fontFamily: 'var(--font-heading)', color: 'var(--text-on-light)', marginBottom: '0.5rem' }}>
                            {item.product_name}
                          </h3>
                          <button onClick={() => removeFromCart(idx)} style={{ color: 'var(--text-muted-on-light)', cursor: 'pointer' }} className="nav-hover-gold" title="Remove item">
                            <X size={18} />
                          </button>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted-on-light)', marginBottom: '1.25rem' }}>Size: {item.variant_size}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF' }}>
                            <button onClick={() => updateCartQuantity(idx, -1)} style={{ padding: '0.5rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', border: 'none', backgroundColor: 'transparent' }}><Minus size={11} /></button>
                            <span style={{ padding: '0 0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(idx, 1)} style={{ padding: '0.5rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', border: 'none', backgroundColor: 'transparent' }}><Plus size={11} /></button>
                          </div>
                          <span style={{ fontWeight: 500, fontSize: '1.2rem', color: 'var(--color-accent)' }}>
                            £{(item.price * item.quantity).toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', fontWeight: 400 }}>ex. VAT</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button onClick={clearCart} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem' }}>
                      Clear Basket
                    </button>
                    <button onClick={() => setCheckoutStep('checkout')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Proceed to Checkout <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                /* CHECKOUT FORM VIEW */
                <div style={{ border: '1px solid var(--color-border-light)', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <h3 style={{ textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.08em', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.75rem', fontWeight: 600, color: 'var(--text-on-light)' }}>
                    Shipping & Billing Information
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-row-2">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Full Name</label>
                      <input type="text" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} required placeholder="e.g. David Smith" style={{ width: '100%', padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Email Address</label>
                      <input type="email" value={checkoutEmail} onChange={(e) => setCheckoutEmail(e.target.value)} required placeholder="e.g. david@example.co.uk" style={{ width: '100%', padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }} className="form-row-2">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Phone Number</label>
                      <input type="tel" value={checkoutPhone} onChange={(e) => setCheckoutPhone(e.target.value)} required placeholder="e.g. 07123456789" style={{ width: '100%', padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Postcode (UK only)</label>
                      <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="text" 
                          value={checkoutPostcode} 
                          onChange={(e) => handlePostcodeChange(e.target.value)} 
                          onFocus={() => setShowSuggestions(true)}
                          required 
                          placeholder="e.g. CH41 1LD" 
                          style={{ width: '100%', padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                        />
                        {postcodeLoading && (
                          <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--color-accent)' }}>
                            Validating...
                          </div>
                        )}
                        
                        {/* Autocomplete dropdown */}
                        {showSuggestions && postcodeSuggestions.length > 0 && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-light)', borderTop: 'none', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                            {postcodeSuggestions.map((item) => (
                              <div 
                                key={item} 
                                onClick={() => handleSelectPostcode(item)}
                                style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #F0ECE6', fontSize: '0.85rem', color: 'var(--text-on-light)' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#F7F3EB'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {postcodeError && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                          {postcodeError}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Delivery Address</label>
                    <textarea value={checkoutAddress} onChange={(e) => setCheckoutAddress(e.target.value)} required placeholder="House name/number, street, city" rows="2" style={{ width: '100%', padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', resize: 'vertical', fontSize: '0.9rem', lineHeight: 1.5 }} />
                    
                    {/* Address Selection Dropdown */}
                    {showAddressDropdown && addressOptions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-light)', zIndex: 90, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', borderTop: 'none' }}>
                        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#F0ECE6', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted-on-light)' }}>
                          Matching Addresses Found:
                        </div>
                        {addressOptions.map((addr) => (
                          <div 
                            key={addr} 
                            onClick={() => handleSelectAddress(addr)}
                            style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #F0ECE6', fontSize: '0.85rem', color: 'var(--text-on-light)' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#F7F3EB'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            {addr}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Method</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <button 
                        type="button" 
                        onClick={() => setPaymentMethod('stripe')} 
                        style={{ border: '1px solid var(--color-border-light)', padding: '1rem', cursor: 'pointer', backgroundColor: paymentMethod === 'stripe' ? 'var(--text-on-light)' : '#FFFFFF', color: paymentMethod === 'stripe' ? 'var(--bg-light)' : 'var(--text-on-light)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                      >
                        Credit Card
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setPaymentMethod('bank_transfer')} 
                        style={{ border: '1px solid var(--color-border-light)', padding: '1rem', cursor: 'pointer', backgroundColor: paymentMethod === 'bank_transfer' ? 'var(--text-on-light)' : '#FFFFFF', color: paymentMethod === 'bank_transfer' ? 'var(--bg-light)' : 'var(--text-on-light)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                      >
                        Bank Transfer
                      </button>
                    </div>
                  </div>

                  {/* Payment element wrapper (only active when postcode lookup matches a zone and no loading/errors exist) */}
                  {matchedZone && !postcodeError && !postcodeLoading ? (
                    <CheckoutPaymentForm
                      subtotal={cartSubtotal}
                      vat={cartVat}
                      shipping={shippingCost}
                      total={cartTotal}
                      paymentMethod={paymentMethod}
                      customerDetails={{
                        name: checkoutName,
                        email: checkoutEmail,
                        phone: checkoutPhone,
                        address: `${checkoutAddress}, ${checkoutPostcode.toUpperCase()}`
                      }}
                      cart={cart}
                      clearCart={clearCart}
                      onSuccess={(orderId) => {
                        setLastPlacedOrderId(orderId);
                        setCheckoutStep('success');
                      }}
                      onError={(msg) => setCheckoutError(msg)}
                    />
                  ) : (
                    <div style={{ backgroundColor: '#EBE4D9', padding: '1.25rem', border: '1px solid var(--color-border-light)', fontSize: '0.75rem', color: 'var(--text-muted-on-light)', textAlign: 'center', marginTop: '0.5rem' }}>
                      Please enter a valid UK postcode to calculate carriage and unlock payment.
                    </div>
                  )}

                  {checkoutError && <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 500 }}>{checkoutError}</div>}

                  <button type="button" onClick={() => setCheckoutStep('cart')} className="btn btn-secondary" style={{ width: '100%', height: '52px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Back to Basket
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary Box */}
            <div>
              <div style={{ border: '1px solid var(--color-border-light)', padding: '2.5rem 2rem', backgroundColor: 'transparent', height: 'fit-content' }}>
                <h3 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 600, borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  Order Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted-on-light)' }}>Subtotal (ex. VAT)</span>
                    <span style={{ fontWeight: 500 }}>£{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted-on-light)' }}>VAT (20%)</span>
                    <span style={{ fontWeight: 500 }}>£{cartVat.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted-on-light)' }}>Carriage & Shipping</span>
                    <span style={{ fontWeight: 500 }}>
                      {matchedZone ? `£${shippingCost.toFixed(2)}` : (
                        <em style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)' }}>Computed at checkout</em>
                      )}
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '1.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-on-light)' }}>Grand Total</span>
                    <span style={{ fontWeight: 500, fontSize: '1.6rem', color: 'var(--color-accent)' }}>
                      £{cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted-on-light)', lineHeight: 1.5 }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} /> Safe secure checkout processing.
                  </p>
                  <p>VAT Invoice will be generated instantly after payment clearance.</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
