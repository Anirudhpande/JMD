import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Send } from 'lucide-react';

export default function Contact() {
  React.useEffect(() => {
    document.title = "Contact JMD Global Stones | Wirral & Southampton Yards";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Get in touch with JMD Global Stones. Call or WhatsApp 07450148506, email sales@jmdglobalstones.co.uk, or visit our Wirral HQ and Southampton yard locations.");
  }, []);

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
    window.open('https://wa.me/447450148506', '_blank');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '6rem 0', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '3rem' }}>
          <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em' }}>Connect With Us</span>
          <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', marginTop: '0.75rem', marginBottom: '1.5rem', fontWeight: 400 }}>Contact JMD Global Stones</h1>
          <p style={{ color: 'var(--text-muted-on-light)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
            Speak directly with our directors or yard managers for stock updates, pricing sheets, or shipping coordination.
          </p>
        </div>

        {/* Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem' }} className="contact-layout">
          
          {/* Left Column: Form & General Info */}
          <div>
            <div style={{ border: '1px solid var(--color-border-light)', padding: '3rem 2.5rem', marginBottom: '2.5rem', backgroundColor: 'transparent' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '2rem', fontWeight: 400 }}>Send a Message</h2>
              
              {submitted ? (
                <div style={{ border: '1px solid var(--color-accent)', padding: '2rem', textAlign: 'center', backgroundColor: '#EBE4D9' }}>
                  <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--color-accent)', marginBottom: '0.5rem', letterSpacing: '0.1em', fontWeight: 600 }}>Message Sent</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted-on-light)' }}>
                    Thank you. A yard representative will review your message and contact you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. David L." 
                      style={{ width: '100%', padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. david@gmail.com" 
                      style={{ width: '100%', padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. 07123456789" 
                      style={{ width: '100%', padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Message</label>
                    <textarea 
                      required 
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="List details of stone type, quantity in m2 or packs, and delivery postcode..." 
                      rows="5"
                      style={{ width: '100%', padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', resize: 'vertical', fontSize: '0.9rem', lineHeight: 1.5 }} 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '52px', fontSize: '0.8rem', letterSpacing: '0.12em' }}>
                    <Send size={15} /> Send Inquiry
                  </button>
                </form>
              )}
            </div>

            {/* WhatsApp CTA */}
            <div style={{ border: '1px solid var(--color-border-light)', padding: '2.5rem 2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', backgroundColor: 'transparent' }}>
              <div style={{ width: '48px', height: '48px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.5rem' }}>WhatsApp Live Chat</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-on-light)', marginBottom: '1.25rem', lineHeight: 1.5 }}>Connect directly with Roopesh for immediate price sheet sheets and stock level reviews.</p>
                <button onClick={handleWhatsApp} className="btn btn-outline-gold" style={{ padding: '0.6rem 1.5rem', fontSize: '0.75rem' }}>
                  Chat on WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Yards & Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Yards details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }} className="locations-grid">
              
              <div style={{ padding: '2.5rem 2rem', border: '1px solid var(--color-border-light)', backgroundColor: 'transparent' }}>
                <MapPin size={22} style={{ color: 'var(--color-accent)', marginBottom: '1.25rem' }} />
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)', fontWeight: 400, marginBottom: '1rem' }}>Wirral HQ</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-on-light)', lineHeight: 1.65 }}>
                  Twelve Quays House,<br />
                  Egerton Wharf,<br />
                  Wirral, CH41 1LD
                </p>
              </div>

              <div style={{ padding: '2.5rem 2rem', border: '1px solid var(--color-border-light)', backgroundColor: 'transparent' }}>
                <MapPin size={22} style={{ color: 'var(--color-accent)', marginBottom: '1.25rem' }} />
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)', fontWeight: 400, marginBottom: '1rem' }}>Southampton Yard</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-on-light)', lineHeight: 1.65 }}>
                  Yard 2, Eling Wharf,<br />
                  Southampton,<br />
                  Hampshire, SO40 4TE
                </p>
              </div>

            </div>

            {/* General Contact Info Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '1.5rem', border: '1px solid var(--color-border-light)', fontSize: '0.85rem', backgroundColor: 'transparent' }} className="info-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-on-light)' }}>
                <Phone size={16} style={{ color: 'var(--color-accent)' }} />
                <span>07450148506</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-on-light)' }}>
                <Mail size={16} style={{ color: 'var(--color-accent)' }} />
                <span>sales@jmdglobalstones.co.uk</span>
              </div>
            </div>

            {/* Google Map Mock Embed */}
            <div style={{ flexGrow: 1, minHeight: '320px', border: '1px solid var(--color-border-light)', position: 'relative', overflow: 'hidden', backgroundColor: '#EBE4D9' }}>
              
              {/* Premium Grid Mock Map */}
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', textAlign: 'center' }}>
                <MapPin size={30} style={{ color: 'var(--color-accent)', marginBottom: '1.25rem', animation: 'bounce 2.5s infinite' }} />
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '0.75rem', fontWeight: 400 }}>Wirral & Southampton stockyards</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted-on-light)', maxWidth: '280px', lineHeight: 1.5 }}>
                  Interactive coordinate references and loading bay guidelines mapped for trade collection.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.65rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', border: '1px solid var(--color-border-light)', color: 'var(--text-on-light)' }}>53.3965° N, 3.0125° W</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', border: '1px solid var(--color-border-light)', color: 'var(--text-on-light)' }}>50.9038° N, 1.4828° W</span>
                </div>
              </div>

              {/* Float Overlay */}
              <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', padding: '0.6rem 1.25rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Yard collection: Mon-Fri 8am - 4:30pm
              </div>

            </div>

          </div>

        </div>

      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (max-width: 768px) {
          .contact-layout { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .locations-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
          .info-bar { flex-direction: column; gap: 1.25rem; align-items: center; }
        }
      `}</style>
    </div>
  );
}
