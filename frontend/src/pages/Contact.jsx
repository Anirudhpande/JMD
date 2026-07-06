import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Send } from 'lucide-react';
import useSEO from '../hooks/useSEO.js';

export default function Contact() {
  useSEO({
    title: 'Contact Us | JMD Global Stones Wirral & Southampton Yard',
    description: 'Get in touch with JMD Global Stones. Call or WhatsApp 07458148586 (Roopesh Kapur), email sales@jmdglobalstones.co.uk, or visit our Wirral HQ and Southampton Yard.',
    canonical: 'https://jmdglobalstones.co.uk/contact'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/447458148586', '_blank');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '1.25rem 0 2rem 0', minHeight: 'calc(100vh - 90px)' }}>
      <div className="container" style={{ width: '100%' }}>
        
        {/* Header - Compact */}
        <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.5rem' }}>
          <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em' }}>Connect With Us</span>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginTop: '0.15rem', marginBottom: '0.35rem', fontWeight: 400 }}>Contact JMD Global Stones</h1>
          <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.88rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.4 }}>
            Speak directly to Roopesh for stock updates, pricing sheets, or shipping coordination.
          </p>
        </div>

        {/* Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '2.5rem', alignItems: 'stretch' }} className="contact-layout">
          
          {/* Left Column: Form & General Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem 1.75rem', backgroundColor: '#FFFFFF', borderRadius: '4px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '1.25rem', fontWeight: 400, color: '#111' }}>Send a Message</h2>
              
              {submitted ? (
                <div style={{ border: '1px solid var(--color-accent)', padding: '2.5rem 1.5rem', textAlign: 'center', backgroundColor: '#EBE4D9', borderRadius: '4px' }}>
                  <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--color-accent)', marginBottom: '0.5rem', letterSpacing: '0.1em', fontWeight: 600 }}>Message Sent</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted-on-light)', margin: 0 }}>
                    Thank you. A yard representative will review your message and contact you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-row-grid">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111' }}>Your Name</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. David L." 
                        style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.85rem', borderRadius: '4px' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111' }}>Email Address</label>
                      <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="e.g. david@gmail.com" 
                        style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.85rem', borderRadius: '4px' }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111' }}>Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. 07123456789" 
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.85rem', borderRadius: '4px' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111' }}>Message</label>
                    <textarea 
                      required 
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Stone type, quantity in m2/packs, delivery postcode..." 
                      rows="2"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', resize: 'none', fontSize: '0.85rem', lineHeight: 1.45, borderRadius: '4px' }} 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '44px', fontSize: '0.78rem', letterSpacing: '0.1em', borderRadius: '30px', marginTop: '0.25rem' }}>
                    <Send size={14} /> Send Inquiry
                  </button>
                </form>
              )}
            </div>

            {/* WhatsApp CTA - Compact Row */}
            <div style={{ border: '1px solid var(--color-border-light)', padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: '4px' }}>
              <div style={{ width: '40px', height: '40px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%' }}>
                <MessageSquare size={18} />
              </div>
              <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }} className="whatsapp-row">
                <div style={{ maxWidth: '300px' }}>
                  <h3 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, margin: '0 0 0.15rem', color: '#111' }}>WhatsApp Live Chat</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted-on-light)', margin: 0, lineHeight: 1.4 }}>Quick stock sheets and custom pricing quotes.</p>
                </div>
                <button onClick={handleWhatsApp} className="btn btn-outline-gold" style={{ padding: '0.5rem 1.25rem', fontSize: '0.72rem', borderRadius: '30px', height: '36px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  Chat Now
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Yards & Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Yards details - Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="locations-grid">
              
              <div style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MapPin size={18} style={{ color: 'var(--color-accent)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', fontWeight: 600, margin: 0, color: '#111' }}>Southampton Yard</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted-on-light)', lineHeight: 1.5, margin: 0 }}>
                  Yard 2, Eling Wharf, Southampton,<br />Hampshire, SO40 4TE
                </p>
              </div>

              <div style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MapPin size={18} style={{ color: 'var(--color-accent)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', fontWeight: 600, margin: 0, color: '#111' }}>Wirral HQ</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted-on-light)', lineHeight: 1.5, margin: 0 }}>
                 70 Grange Road East, Wirral, United Kingdom, CH41 5FE,<br />
                </p>
              </div>

            </div>

            {/* General Contact Info Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '1.25rem', border: '1px solid var(--color-border-light)', fontSize: '0.82rem', backgroundColor: '#FFFFFF', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', gap: '1rem' }} className="info-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#111', fontWeight: 600 }}>
                  <Phone size={14} style={{ color: 'var(--color-accent)' }} />
                  <span>07458148586 (Roopesh)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#111', fontWeight: 600 }}>
                  <Mail size={14} style={{ color: 'var(--color-accent)' }} />
                  <span>sales@jmdglobalstones.co.uk</span>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted-on-light)', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.65rem', marginTop: '0.15rem' }}>
                <strong>Reg. Office:</strong> 70 Grange Road East, Wirral, United Kingdom, CH41 5FE
              </div>
            </div>

            {/* Google Map Mock Embed - Compact Side by Side */}
            <div style={{ border: '1px solid var(--color-border-light)', overflow: 'hidden', borderRadius: '4px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '170px' }} className="maps-row-grid">
                
                {/* Southampton Map */}
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '5px', left: '5px', zIndex: 2, backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', padding: '0.2rem 0.5rem', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, borderRadius: '2px' }}>
                    Southampton Yard
                  </div>
                  <iframe
                    title="JMD Global Stones Southampton Yard"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2520.0!2d-1.4828!3d50.9038!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487469a4d8be04a3%3A0x0!2sEling+Wharf%2C+Southampton%2C+SO40+4TE!5e0!3m2!1sen!2suk!4v1700000000001"
                    width="100%"
                    height="170"
                    style={{ border: 0, display: 'block', filter: 'grayscale(20%)' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Wirral HQ Map */}
                <div style={{ position: 'relative', overflow: 'hidden', borderLeft: '1px solid var(--color-border-light)' }}>
                  <div style={{ position: 'absolute', top: '5px', left: '5px', zIndex: 2, backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', padding: '0.2rem 0.5rem', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, borderRadius: '2px' }}>
                    Wirral HQ
                  </div>
                  <iframe
                    title="JMD Global Stones Wirral HQ"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2380.0!2d-3.0125!3d53.3965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487b20a2b4c9cc73%3A0x0!2sTwelve+Quays+House%2C+Egerton+Wharf%2C+Birkenhead%2C+CH41+1LD!5e0!3m2!1sen!2suk!4v1700000000000"
                    width="100%"
                    height="170"
                    style={{ border: 0, display: 'block', filter: 'grayscale(20%)', borderLeft: '1px solid var(--color-border-light)' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

              </div>

              {/* Bottom bar */}
              <div style={{ backgroundColor: '#2E3033', color: 'rgba(255,255,255,0.6)', padding: '0.45rem 1rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border-light)' }}>
                <span>Yard collection: Mon–Fri 8am–4:30pm</span>
                <span>53.3965° N — 50.9038° N</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-layout { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .locations-grid { grid-template-columns: 1fr !important; gap: 0.75rem !important; }
          .info-bar { flex-direction: column; gap: 0.65rem; align-items: center; }
          .form-row-grid { grid-template-columns: 1fr !important; gap: 0.95rem !important; }
          .whatsapp-row { flex-direction: column; align-items: flex-start !important; gap: 0.75rem !important; }
          .maps-row-grid { grid-template-columns: 1fr !important; height: auto !important; }
          .maps-row-grid iframe { height: 160px !important; }
        }
      `}</style>
    </div>
  );
}
