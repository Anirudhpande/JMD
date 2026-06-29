import React from 'react';
import { ShieldAlert, AlertCircle, Compass, Truck, Milestone, FileSignature } from 'lucide-react';
import useSEO from '../hooks/useSEO.js';

export default function Delivery() {
  useSEO({
    title: 'Delivery Information | UK-Wide Stone Paving Delivery',
    description: 'JMD Global Stones offers UK-wide kerbside paving delivery. Learn about our HGV access requirements, delivery timelines, and flat-rate shipping costs.',
    canonical: 'https://jmdglobalstones.co.uk/delivery'
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '8rem 0', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ marginBottom: '6rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '3.5rem' }}>
          <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em' }}>Logistics & Carriage</span>
          <h1 style={{ fontSize: '3.6rem', fontFamily: 'var(--font-heading)', marginTop: '0.75rem', marginBottom: '1.5rem', fontWeight: 400, lineHeight: 1.1 }}>
            Delivery Guidelines & Logistics
          </h1>
          <p style={{ color: 'var(--text-muted-on-light)', fontSize: '1.15rem', maxWidth: '800px', lineHeight: 1.75 }}>
            To ensure the safe arrival of your natural stone or vitrified porcelain, please review our heavy goods vehicle (HGV) delivery rules. All paving packages are dispatched in crates and require flat, solid surface access.
          </p>
        </div>

        {/* Timeline Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2.5rem', backgroundColor: '#FFFFFF', padding: '3rem 2.5rem', border: '1px solid var(--color-border-light)', marginBottom: '6rem', textAlign: 'center' }} className="delivery-timeline-grid">
          <div>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted-on-light)', marginBottom: '0.5rem' }}>Carriage Rate</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 400, color: 'var(--text-on-light)', fontFamily: 'var(--font-heading)' }}>£49 Flat Rate</p>
          </div>
          <div style={{ borderLeft: '1px solid var(--color-border-light)' }}>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted-on-light)', marginBottom: '0.5rem' }}>Dispatch Timeline</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 400, color: 'var(--text-on-light)', fontFamily: 'var(--font-heading)' }}>3–5 Working Days</p>
          </div>
          <div style={{ borderLeft: '1px solid var(--color-border-light)' }}>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted-on-light)', marginBottom: '0.5rem' }}>Service Type</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 400, color: 'var(--text-on-light)', fontFamily: 'var(--font-heading)' }}>Kerbside Drop Only</p>
          </div>
          <div style={{ borderLeft: '1px solid var(--color-border-light)' }}>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted-on-light)', marginBottom: '0.5rem' }}>Standard Fleet</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 400, color: 'var(--text-on-light)', fontFamily: 'var(--font-heading)' }}>18–28t Tail-Lift HGV</p>
          </div>
        </div>

        {/* Main Grid: Info Cards + Vertical Truck Image */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3.5rem', marginBottom: '6rem' }} className="delivery-main-layout">
          
          {/* Left Column: 6 Logistics Rules */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2.5rem' }} className="delivery-grid">
            
            {/* Box 1 */}
            <div style={{ border: '1px solid var(--color-border-light)', padding: '3.5rem 2.5rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '45px', height: '45px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={22} />
                </div>
                <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>1. Access Road</h3>
              </div>
              <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.95rem', lineHeight: 1.75 }}>
                Our heavy delivery lorries require a clear, level roadway with at least <strong>3.2 meters of width</strong> clearance. Ensure there are no overhead cables, low-hanging tree branches, or tight turns that would block an HGV.
              </p>
            </div>

            {/* Box 2 */}
            <div style={{ border: '1px solid var(--color-border-light)', padding: '3.5rem 2.5rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '45px', height: '45px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={22} />
                </div>
                <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>2. Delivery Vehicle</h3>
              </div>
              <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.95rem', lineHeight: 1.75 }}>
                Standard delivery utilizes a large <strong>18 to 28 tonne tail-lift rigid HGV lorry</strong>. The driver will lower the stone pallets from the tail-gate using a manual pump truck and place them at the closest accessible kerbside point.
              </p>
            </div>

            {/* Box 3 */}
            <div style={{ border: '1px solid var(--color-border-light)', padding: '3.5rem 2.5rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '45px', height: '45px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Milestone size={22} />
                </div>
                <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>3. Road Surface</h3>
              </div>
              <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.95rem', lineHeight: 1.75 }}>
                The pump truck can only operate on flat, firm, solid surfaces like tarmac, concrete, or block paving. It <strong>cannot pull pallets over gravel, grass, cobbles, sand, soil, or steep inclines</strong>.
              </p>
            </div>

            {/* Box 4 */}
            <div style={{ border: '1px solid var(--color-border-light)', padding: '3.5rem 2.5rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '45px', height: '45px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={22} />
                </div>
                <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>4. Delivery Point</h3>
              </div>
              <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.95rem', lineHeight: 1.75 }}>
                Deliveries are strictly <strong>kerbside-only</strong>. Drivers are not insured or permitted to wheel pallets onto your private driveway, rear garden, or move them beyond the tail-lift point. Landscapers should prepare accordingly.
              </p>
            </div>

            {/* Box 5 */}
            <div style={{ border: '1px solid var(--color-border-light)', padding: '3.5rem 2.5rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '45px', height: '45px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={22} />
                </div>
                <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>5. Pallet Inspection</h3>
              </div>
              <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.95rem', lineHeight: 1.75 }}>
                Sandstone and porcelain slabs are heavy and fragile. Immediately inspect the wooden crates/pallets upon arrival. Any transit damage or broken flags must be marked on the delivery note.
              </p>
            </div>

            {/* Box 6 */}
            <div style={{ border: '1px solid var(--color-border-light)', padding: '3.5rem 2.5rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '45px', height: '45px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileSignature size={22} />
                </div>
                <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>6. Signature</h3>
              </div>
              <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.95rem', lineHeight: 1.75 }}>
                An adult must be present at the delivery location to inspect the items and sign for the delivery. We <strong>cannot leave heavy building material unattended</strong> without prior written instruction.
              </p>
            </div>

          </div>

          {/* Right Column: Lorry Image panel */}
          <div style={{ border: '1px solid var(--color-border-light)', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flexGrow: 1, height: '100%', minHeight: '400px' }}>
              <img 
                src="/images/delivery_lorry.png" 
                alt="JMD tail-lift HGV delivery truck unloading stone crates" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-on-dark)', padding: '2.5rem 2rem', borderTop: '1px solid var(--color-accent)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-accent)', marginBottom: '0.75rem', fontWeight: 400 }}>HGV Accessibility Standard</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-on-dark)', lineHeight: 1.6 }}>
                A standard rigid tail-lift vehicle matches the scale shown above. If your road cannot fit this lorry, please contact us to discuss small truck alternatives before your dispatch window.
              </p>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 1200px) {
          .delivery-timeline-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1.5rem !important; }
          .delivery-timeline-grid > div { border-left: none !important; border-bottom: 1px solid var(--color-border-light); padding-bottom: 1rem; }
          .delivery-timeline-grid > div:nth-child(3), .delivery-timeline-grid > div:nth-child(4) { border-bottom: none; }
          .delivery-main-layout { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .delivery-main-layout > div:last-child { height: 450px !important; }
        }
        @media (max-width: 768px) {
          .delivery-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .delivery-warning-panel { flex-direction: column; gap: 1.5rem; padding: 2rem; }
        }
      `}</style>
    </div>
  );
}
