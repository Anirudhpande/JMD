import React, { useState } from 'react';
import { Sparkles, Hammer, Info, Droplets, CheckCircle } from 'lucide-react';
import useSEO from '../hooks/useSEO.js';

const materialLayingInfo = {
  sandstone: {
    title: "Indian Sandstone Laying Advice",
    laying: [
      "Slurry Priming: Standard riven Indian sandstone is porous and requires a polymer slurry primer (SBR) applied to the back of each slab before placing onto the wet mortar bed.",
      "Wet Mortar Mix: Use a sharp sand and cement mix (ratio 4:1) that is semi-wet. Do not lay sandstone on dot-and-dab mortar, as this will lead to slab movement and moisture staining.",
      "Calibrated Slabs: JMD sandstone is calibrated to 22mm thickness, making it much easier to level than non-calibrated stone."
    ],
    maintenance: [
      "Sealing: We recommend sealing sandstone patios after installation (once the mortar has dried and any efflorescence has cleared, typically 8-12 weeks). Sealing guards against moss and organic staining.",
      "Cleaning: Wash regular dirt off using standard soapy water and a stiff brush. Avoid using acidic cleaners, as these can react with the iron minerals naturally present in sandstone and cause rust stains."
    ]
  },
  porcelain: {
    title: "Vitrified Porcelain Laying Advice",
    laying: [
      "Full Primer Coat: Porcelain has near-zero porosity. It is mandatory to apply a full coat of porcelain priming slurry to the back of every slab to ensure bonding with the mortar bed.",
      "Flat Wet Mortar Bed: Lay on a flat, even 4:1 mortar bed. Ensure 100% coverage with no air gaps, as porcelain is thin (typically 20mm) and relies on the bed for structural support.",
      "Tile Spacers: Use tile spacers (minimum 3-5mm) to accommodate jointing. Jointing must be completed using dedicated porcelain outdoor grout."
    ],
    maintenance: [
      "Sealing: Premium porcelain paving is vitrified and completely non-porous. It does not require any sealing or protective coatings.",
      "Cleaning: Easy to clean. Simply pressure-wash or use a mild detergent. Algae and dirt cannot penetrate the surface, so standard washing easily keeps it pristine."
    ]
  }
};

const installationSteps = [
  {
    title: "1. Excavation & Ground Prep",
    desc: "Dig out the patio area to a depth of roughly 150mm. Lay down a slight fall (1:80) to direct surface rainwater runoff away from home foundations."
  },
  {
    title: "2. Compact the Sub-Base",
    desc: "Lay down at least 100mm of MOT Type 1 sub-base aggregate. Compact thoroughly using a mechanical vibrating plate compactor to create a solid foundation."
  },
  {
    title: "3. Prepare the Mortar Bed",
    desc: "Mix sharp sand and cement at a 4:1 ratio to a semi-wet consistency. Lay a full, continuous bed of mortar roughly 30-40mm thick for the slab to sit in."
  },
  {
    title: "4. Apply Slurry Primer",
    desc: "Coat the underside of the slab with SBR slurry primer using a large brush. This prevents moisture draw-up and guarantees the slab will bond to the mortar bed."
  },
  {
    title: "5. Lay & Tap Slabs",
    desc: "Carefully lower the slab onto the bed. Use a rubber mallet to tap the slab down to the correct level and fall, checking constantly with a spirit level."
  },
  {
    title: "6. Jointing & Grouting",
    desc: "After the mortar has set (usually 24-48 hours), fill the joints (minimum 5-10mm width) with a brush-in jointing compound or sand/cement mortar mix."
  }
];

export default function Care() {
  const [activeTab, setActiveTab] = useState('sandstone');

  useSEO({
    title: 'Stone Laying Advice, Care & Maintenance Guide',
    description: 'Expert laying advice and maintenance guides for Indian Sandstone and vitrified Porcelain paving. Learn correct priming, mortar mix, and cleaning techniques.',
    canonical: 'https://jmdglobalstones.co.uk/care'
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '0.75rem 0 6rem 0', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '2rem' }}>
          <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em' }}>Technical Advisory</span>
          <h1 style={{ fontSize: '3.6rem', fontFamily: 'var(--font-heading)', marginTop: '0.75rem', marginBottom: '1.5rem', fontWeight: 400, lineHeight: 1.1 }}>
            Laying Advice, Care & Maintenance
          </h1>
          <p style={{ color: 'var(--text-muted-on-light)', fontSize: '1.15rem', maxWidth: '800px', lineHeight: 1.75 }}>
            Natural stone and vitrified porcelain paving are long-term structural investments. Ensure your patio retains its architectural integrity by adhering to standard UK paving guidelines, SBR slurry priming, and material-specific maintenance.
          </p>
        </div>

        {/* Tab & Content Grid (Images + Guide) */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr', gap: '3.5rem', marginBottom: '3rem' }} className="care-layout">
          
          {/* Column 1: Material Selection */}
          <div>
            <h3 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1.75rem', color: 'var(--text-on-light)', fontWeight: 600 }}>
              Select Material
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.keys(materialLayingInfo).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{ 
                    width: '100%', 
                    padding: '1.5rem 1.75rem', 
                    textAlign: 'left', 
                    border: '1px solid var(--color-border-light)', 
                    backgroundColor: activeTab === key ? 'var(--text-on-light)' : 'transparent', 
                    color: activeTab === key ? 'var(--bg-light)' : 'var(--text-on-light)', 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em', 
                    fontSize: '0.85rem',
                    cursor: 'pointer', 
                    transition: 'var(--transition-smooth)' 
                  }}
                  className="nav-hover-gold"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Detailed Guides */}
          <div style={{ border: '1px solid var(--color-border-light)', padding: '3.5rem 3rem', backgroundColor: '#FFFFFF' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1.25rem', fontWeight: 400, color: 'var(--text-on-light)' }}>
              {materialLayingInfo[activeTab].title}
            </h2>

            {/* Laying Advice */}
            <div style={{ marginBottom: '3.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.5rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                <Hammer size={18} /> Installation Specifications
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', listStyle: 'none' }}>
                {materialLayingInfo[activeTab].laying.map((tip, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--text-muted-on-light)', lineHeight: 1.7 }}>
                    <span style={{ color: 'var(--color-accent)', fontSize: '1.2rem', lineHeight: '1rem' }}>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Maintenance Advice */}
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.5rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                <Sparkles size={18} /> Preservation & Care
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', listStyle: 'none' }}>
                {materialLayingInfo[activeTab].maintenance.map((tip, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--text-muted-on-light)', lineHeight: 1.7 }}>
                    <span style={{ color: 'var(--color-accent)', fontSize: '1.2rem', lineHeight: '1rem' }}>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Rich Technical Imagery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ border: '1px solid var(--color-border-light)', overflow: 'hidden', flexGrow: 1, position: 'relative', minHeight: '380px' }}>
              <img 
                src="/images/paving_installation.png" 
                alt="Paving stone mortar bed prep and laying" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(17, 17, 17, 0.85)', padding: '2rem', borderTop: '1px solid var(--color-accent)' }}>
                <h4 style={{ color: '#FFFFFF', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Under-slab Slurry Priming</h4>
                <p style={{ color: '#EBE4D9', fontSize: '0.8rem', lineHeight: 1.6 }}>
                  Calibrated Indian Sandstone and Vitrified Porcelain flags require SBR bonding agent slurry applied to the rear face before placing on wet mortar. This creates a solid adhesive bond and blocks moisture staining.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Big Visual Patio Showcase & Introduction */}
        <section style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '6rem', marginBottom: '8rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '4rem', alignItems: 'center' }} className="care-showcase-layout">
            <div>
              <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em' }}>Finished Result</span>
              <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', fontWeight: 400, marginTop: '0.5rem', marginBottom: '2rem', lineHeight: 1.15 }}>
                Achieve the Showroom Standard Patio
              </h2>
              <p style={{ color: 'var(--text-muted-on-light)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '2rem' }}>
                A beautifully finished natural stone or vitrified porcelain patio is a perfect blend of high-end raw material and sound sub-base preparation. Ensure your ground preparation guidelines are carefully followed. Compacting 100mm of MOT Type 1 aggregate guarantees a structure that withstands weathering, freeze-thaw cycles, and heavy loads.
              </p>
              <div style={{ borderLeft: '2px solid var(--color-accent)', paddingLeft: '1.5rem', margin: '2rem 0' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--text-on-light)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                  "Proper calibrated stone preparation blocks organic staining, prevents individual slabs from rocking or breaking, and maintains clean joints over decades of British weather."
                </p>
                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem', color: 'var(--text-muted-on-light)' }}>
                  — Roopesh, Stone Mason & Technical Director
                </span>
              </div>
            </div>

            <div style={{ border: '1px solid var(--color-border-light)', overflow: 'hidden', height: '480px' }}>
              <img 
                src="/images/stone_patio_layout.png" 
                alt="Beautiful finished sandstone patio layout" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Patio Sub-Base & Installation Timeline</h2>
            <p style={{ color: 'var(--text-muted-on-light)', fontSize: '1.05rem', marginTop: '0.5rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Standard professional patio layout guidelines for natural stone and porcelain slabs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }} className="install-grid">
            {installationSteps.map((step, idx) => (
              <div key={idx} style={{ border: '1px solid var(--color-border-light)', padding: '3.5rem 2.5rem', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '260px' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--color-accent)', fontWeight: 300, display: 'block', lineHeight: 1, marginBottom: '1.25rem' }}>
                    0{idx + 1}
                  </span>
                  <h4 style={{ textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-on-light)', marginBottom: '1rem' }}>
                    {step.title.replace(/^\d+\.\s*/, '')}
                  </h4>
                  <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <style>{`
        @media (max-width: 1200px) {
          .care-layout { grid-template-columns: 1fr 1fr !important; gap: 2.5rem !important; }
          .care-layout > div:first-child { grid-column: span 2; }
          .care-showcase-layout { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .care-showcase-layout > div:last-child { height: 350px !important; }
        }
        @media (max-width: 900px) {
          .install-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1.5rem !important; }
        }
        @media (max-width: 768px) {
          .care-layout { grid-template-columns: 1fr !important; }
          .care-layout > div:first-child { grid-column: span 1; }
          .install-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
