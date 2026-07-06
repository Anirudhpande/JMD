import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import useSEO from '../hooks/useSEO.js';

const faqs = [
  {
    category: 'Ordering & Payment',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Simply browse our products, add items to your basket, enter your delivery postcode to calculate shipping, and proceed to checkout. We accept credit/debit cards via Stripe and bank transfers.'
      },
      {
        q: 'Do you offer trade or bulk pricing?',
        a: 'Yes! We supply both retail customers and trade professionals. For bulk orders or trade account enquiries, please contact us directly via WhatsApp or email at sales@jmdglobalstones.co.uk and we will provide a bespoke quote.'
      },
      {
        q: 'Can I get a sample before ordering?',
        a: 'We strongly recommend ordering a sample before committing to a full pallet. Please contact us via the Contact page or WhatsApp and we can arrange a sample for you.'
      },
      {
        q: 'Is my payment secure?',
        a: 'Absolutely. All card payments are processed via Stripe with 256-bit SSL encryption and 3D Secure authentication. We never store your card details.'
      },
      {
        q: 'Can I pay by bank transfer?',
        a: 'Yes. Select "Bank Transfer" at checkout. Your order will be held until payment clears in our account. Bank details are shown at checkout and in your order confirmation email.'
      }
    ]
  },
  {
    category: 'Delivery & Shipping',
    items: [
      {
        q: 'How much does delivery cost?',
        a: 'Delivery costs vary by postcode zone, ranging from £68 to £200. Enter your postcode in the checkout to see the exact rate for your area. Delivery is by kerbside pallet only.'
      },
      {
        q: 'How long does delivery take?',
        a: 'We aim to deliver orders within 5-7 working days. You will receive a dispatch email with tracking information once your pallet is collected by our haulier.'
      },
      {
        q: 'What is kerbside delivery?',
        a: 'Our HGV lorry will deliver your pallet as close to the kerbside as safely possible. The driver cannot carry slabs into your garden. Please ensure you have enough people available to unload and move the stone to your required location.'
      },
      {
        q: 'Do you deliver to Northern Ireland or Republic of Ireland?',
        a: 'Currently we deliver to mainland UK only (England, Scotland, and Wales). We do not ship to Northern Ireland, Republic of Ireland, or international destinations at this time.'
      },
      {
        q: 'What vehicle access is required?',
        a: 'Our deliveries are made by large HGV lorries (typically 18-tonne vehicles). You must ensure there is suitable road width, height clearance, and turning space for a large vehicle. Check our Delivery Guide page for full details.'
      }
    ]
  },
  {
    category: 'Products & Stone',
    items: [
      {
        q: 'What is the difference between sandstone and porcelain?',
        a: 'Indian Sandstone is a natural stone with unique colour variation and a riven (textured) surface. Porcelain is a manufactured tile with a consistent colour and a harder, more durable surface. Porcelain is better suited for contemporary designs and is virtually maintenance-free, while sandstone offers a more traditional, organic look.'
      },
      {
        q: 'Does the stone colour match what I see on the website?',
        a: 'We photograph our products in natural daylight to give the most accurate representation. However, natural stone has inherent colour variation from slab to slab, which is part of its character. We always recommend ordering a sample to see the colour in your own lighting conditions.'
      },
      {
        q: 'Is the sandstone calibrated?',
        a: 'Yes. All our Indian Sandstone is calibrated to a consistent 22mm thickness, making it much easier to lay to a flat level than non-calibrated stone.'
      },
      {
        q: 'How much stone do I need?',
        a: 'Measure the length × width of your area in metres to get the square meterage. Add 10% for wastage (cutting). Our product pages show the coverage per pack. If in doubt, use the coverage calculator on any product page or contact us for help.'
      },
      {
        q: 'Do I need to seal my sandstone?',
        a: 'We strongly recommend sealing natural sandstone with a suitable impregnating sealer before and after laying. Sealing protects against staining, efflorescence, and moisture penetration. Porcelain does not require sealing.'
      }
    ]
  },
  {
    category: 'Returns & Warranties',
    items: [
      {
        q: 'What if my order arrives damaged?',
        a: 'Please inspect your delivery before the driver leaves and note any visible damage on the delivery note. Take photographs and email them to sales@jmdglobalstones.co.uk within 48 hours of delivery. We will arrange a replacement for genuinely damaged goods.'
      },
      {
        q: 'Can I return stone I no longer need?',
        a: 'We accept returns of unopened, undamaged pallets within 14 days of delivery. Return delivery costs are the responsibility of the customer. Please contact us before arranging any return.'
      },
      {
        q: 'Are there any guarantees on your products?',
        a: 'All our stone is inspected for quality before dispatch. Natural stone is a raw material and minor variations in colour, size, and texture are normal and not considered defects. We guarantee all products to be as described on our website.'
      }
    ]
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState({});

  useSEO({
    title: 'Frequently Asked Questions | Paving, Delivery & Ordering',
    description: 'Answers to common questions about JMD Global Stones — ordering, delivery, stone types, returns, and installation advice.',
    canonical: 'https://jmdglobalstones.co.uk/faq'
  });

  const toggle = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '8rem 0', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>
            <HelpCircle size={18} />
            <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em' }}>Help Centre</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 400, marginBottom: '1rem' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'var(--text-muted-on-light)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto' }}>
            Everything you need to know about ordering, delivery, and our stone products.
            Can't find your answer? <a href="/contact" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Contact us</a>.
          </p>
        </div>

        {/* FAQ Categories */}
        {faqs.map((cat, catIdx) => (
          <div key={catIdx} style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 700,
              color: 'var(--color-accent)',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--color-border-light)'
            }}>
              {cat.category}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {cat.items.map((item, itemIdx) => {
                const key = `${catIdx}-${itemIdx}`;
                const isOpen = !!openItems[key];
                return (
                  <div key={itemIdx} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <button
                      onClick={() => toggle(catIdx, itemIdx)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.25rem 0',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        gap: '1rem'
                      }}
                    >
                      <span style={{
                        fontSize: '0.95rem',
                        fontWeight: isOpen ? 600 : 500,
                        color: isOpen ? 'var(--color-accent)' : 'var(--text-on-light)',
                        transition: 'color 0.2s'
                      }}>
                        {item.q}
                      </span>
                      <span style={{ flexShrink: 0, color: 'var(--color-accent)' }}>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </button>

                    {isOpen && (
                      <div style={{
                        padding: '0 0 1.25rem 0',
                        fontSize: '0.9rem',
                        lineHeight: 1.75,
                        color: 'var(--text-muted-on-light)',
                        animation: 'fadeIn 0.2s ease'
                      }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{
          marginTop: '3rem',
          padding: '2.5rem',
          backgroundColor: '#EBE4D9',
          border: '1px solid var(--color-border-light)',
          textAlign: 'center'
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.75rem' }}>
            Still have questions?
          </h3>
          <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Our yard team is available Monday–Saturday, 8am–5pm.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/contact" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
              Contact Us
            </a>
            <a href="https://wa.me/447458148586" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
              WhatsApp Us
            </a>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
