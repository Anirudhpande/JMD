import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../api.js';

const extractCoverage = (variantSize) => {
  const match = String(variantSize || '').match(/(\d+(\.\d+)?)\s*m²/i);
  return match ? parseFloat(match[1]) : 18.9;
};

const extractDimensions = (variantSize) => {
  const match = String(variantSize || '').match(/\d+x\d+/);
  return match ? match[0] : 'Mixed';
};

const deduceThickness = (productName) => {
  const name = String(productName || '').toLowerCase();
  if (name.includes('porcelain')) return '20mm';
  if (name.includes('brick')) return '65mm';
  return '22mm';
};

const deducePieces = (variantSize) => {
  const match = String(variantSize || '').match(/(\d+)\s*Pcs/i);
  if (match) return parseInt(match[1]);
  const packMatch = String(variantSize || '').toLowerCase();
  if (packMatch.includes('30')) return 30;
  if (packMatch.includes('40')) return 40;
  return 38; // standard fallback
};

export default function Invoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiFetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          const normalizedOrder = {
            ...data,
            subtotal: Number(data.subtotal || 0),
            vat: Number(data.vat || 0),
            shipping: Number(data.shipping || 0),
            total: Number(data.total || 0),
            customer_details: typeof data.customer_details === 'string' 
              ? JSON.parse(data.customer_details) 
              : (data.customer_details || {}),
            shipping_address: typeof data.shipping_address === 'string'
              ? JSON.parse(data.shipping_address)
              : (data.shipping_address || {}),
            items: typeof data.items === 'string'
              ? JSON.parse(data.items)
              : (data.items || [])
          };
          setOrder(normalizedOrder);
          document.title = `Tax Invoice INV-${normalizedOrder.id} | JMD Global Stones`;
        } else {
          setError('Invoice not found or invalid Order ID.');
          document.title = 'Invoice Not Found | JMD Global Stones';
        }
      } catch (err) {
        setError('Network error, failed to load invoice.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-light)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>Loading invoice details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ backgroundColor: 'var(--bg-light)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', border: '1px solid var(--color-danger)', padding: '2rem' }}>
          <AlertTriangle size={32} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Invoice Error</h3>
          <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error || 'Could not retrieve invoice.'}</p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-block' }}>Return Home</Link>
        </div>
      </div>
    );
  }

  const quoteDate = new Date(order.created_at);
  const expiryDate = new Date(order.created_at);
  expiryDate.setDate(expiryDate.getDate() + 7);

  const postcodeVal = (order.customer_details.address || '').match(/[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z]{2}/i);
  const matchedPostcode = postcodeVal ? postcodeVal[0].toUpperCase() : 'KT12 2AW';

  return (
    <div className="invoice-page-wrapper" style={{ backgroundColor: '#FDFCFA', padding: '4rem 0', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Navigation Bar (hidden during print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1rem' }}>
          <Link to={order.user_id !== 'guest' ? '/account' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <ArrowLeft size={16} /> Return to Account
          </Link>
          <button onClick={() => window.print()} className="btn btn-primary" style={{ gap: '0.5rem', display: 'flex', alignItems: 'center', height: '42px', padding: '0 1.5rem' }}>
            <Printer size={16} /> Print Invoice
          </button>
        </div>

        {/* Invoice Page Wrapper */}
        <div className="print-container" style={{ padding: '3rem 2.5rem', backgroundColor: '#FFFFFF', color: '#111111', fontSize: '0.85rem', lineHeight: 1.4 }}>
          
          {/* Centered Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="JMD Global Stones Logo" style={{ height: '70px', objectFit: 'contain', margin: '0 auto' }} />
            
            <p style={{ fontSize: '0.7rem', color: '#111111', marginTop: '1rem', lineHeight: 1.5, letterSpacing: '0.01em' }}>
              Registered Office: Twelve Quays House, Egerton Wharf, Wirral, United Kingdom, CH41 1LD<br />
              Website: www.jmdglobalstones.co.uk | Email: sales@jmdglobalstones.co.uk | Phone: 07450 148506<br />
              Company House No.: 12807959 | VAT No.: GB 358688337
            </p>
          </div>

          {/* Client & Quote Metadata Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2rem', fontSize: '0.85rem' }}>
            {/* Left Col: Customer details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div>
                <strong>Customer:</strong> {order.customer_details.name.toUpperCase()}
              </div>
              <div>
                <strong>Contact Person:</strong> {order.customer_details.name}
              </div>
              <div style={{ marginTop: '0.2rem' }}>
                <strong>Phone:</strong> {order.customer_details.phone || '+44 7467 505748'}
              </div>
              <div style={{ marginTop: '0.8rem' }}>
                <strong>Delivery Postcode:</strong> {matchedPostcode}
              </div>
            </div>

            {/* Right Col: Quote meta details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>Quote Number:</strong></span>
                <span style={{ width: '120px', textAlign: 'left' }}>{order.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>Quote Date:</strong></span>
                <span style={{ width: '120px', textAlign: 'left' }}>{quoteDate.toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>Expiry Date:</strong></span>
                <span style={{ width: '120px', textAlign: 'left' }}>{expiryDate.toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem' }}>
                <span><strong>Sender:</strong></span>
                <span style={{ width: '120px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <span>Roopesh Kapur</span>
                  <span style={{ fontSize: '0.75rem', color: '#555555' }}>(Director)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Items Spreadsheet Table */}
          <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.8rem', border: '1px solid #111111' }}>
            <thead>
              <tr style={{ backgroundColor: '#D9D9D9', borderBottom: '1px solid #111111' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, border: '1px solid #111111', textAlign: 'center', width: '28%' }}>Description</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, border: '1px solid #111111', textAlign: 'center', width: '12%' }}>Size (mm)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, border: '1px solid #111111', textAlign: 'center', width: '10%' }}>Thickness</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, border: '1px solid #111111', textAlign: 'center', width: '8%' }}>Qty (packs)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, border: '1px solid #111111', textAlign: 'center', width: '12%' }}>Coverage / Pack in m²</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, border: '1px solid #111111', textAlign: 'center', width: '12%' }}>Total coverage in m²</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, border: '1px solid #111111', textAlign: 'center', width: '10%' }}>Rate (£/m²)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, border: '1px solid #111111', textAlign: 'center', width: '8%' }}>Line Total (£)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => {
                const size = extractDimensions(item.variant_size);
                const thickness = deduceThickness(item.product_name);
                const qty = item.quantity;
                const coverage = extractCoverage(item.variant_size);
                const totalCoverage = (coverage * qty).toFixed(1);
                const rate = (parseFloat(item.price) / coverage).toFixed(2);
                const lineTotal = (parseFloat(item.price) * qty).toFixed(2);
                return (
                  <tr key={index}>
                    <td style={{ padding: '0.75rem 0.5rem', border: '1px solid #111111', textAlign: 'left' }}>{item.product_name}</td>
                    <td style={{ padding: '0.75rem 0.5rem', border: '1px solid #111111', textAlign: 'center' }}>{size}</td>
                    <td style={{ padding: '0.75rem 0.5rem', border: '1px solid #111111', textAlign: 'center' }}>{thickness}</td>
                    <td style={{ padding: '0.75rem 0.5rem', border: '1px solid #111111', textAlign: 'center' }}>{qty}</td>
                    <td style={{ padding: '0.75rem 0.5rem', border: '1px solid #111111', textAlign: 'center' }}>{coverage.toFixed(1)}</td>
                    <td style={{ padding: '0.75rem 0.5rem', border: '1px solid #111111', textAlign: 'center' }}>{totalCoverage}</td>
                    <td style={{ padding: '0.75rem 0.5rem', border: '1px solid #111111', textAlign: 'center' }}>£ {rate}</td>
                    <td style={{ padding: '0.75rem 0.5rem', border: '1px solid #111111', textAlign: 'right', fontWeight: 500 }}>£ {parseFloat(lineTotal).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
              
              {/* Empty padding spreadsheet rows matching user image exactly */}
              {Array.from({ length: 2 }).map((_, idx) => (
                <tr key={`pad-${idx}`} style={{ height: '28px' }}>
                  <td style={{ border: '1px solid #111111' }}></td>
                  <td style={{ border: '1px solid #111111' }}></td>
                  <td style={{ border: '1px solid #111111' }}></td>
                  <td style={{ border: '1px solid #111111' }}></td>
                  <td style={{ border: '1px solid #111111' }}></td>
                  <td style={{ border: '1px solid #111111' }}></td>
                  <td style={{ border: '1px solid #111111' }}></td>
                  <td style={{ border: '1px solid #111111', textAlign: 'right', paddingRight: '0.5rem', color: '#888888' }}>{idx === 1 && "£ -"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Spreadsheet block */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', border: '1px solid #111111', width: '220px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem', border: '1px solid #111111', textAlign: 'right', fontWeight: 700 }}>Sub Total</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #111111', textAlign: 'right' }}>£ {order.subtotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', border: '1px solid #111111', textAlign: 'right', fontWeight: 700 }}>Delivery</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #111111', textAlign: 'right' }}>{order.shipping > 0 ? `£ ${order.shipping.toFixed(2)}` : '£ -'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', border: '1px solid #111111', textAlign: 'right', fontWeight: 700 }}>VAT @ 20%</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #111111', textAlign: 'right' }}>£ {order.vat.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr style={{ backgroundColor: '#D9D9D9' }}>
                  <td style={{ padding: '0.5rem', border: '1px solid #111111', textAlign: 'right', fontWeight: 700 }}>Total Payable</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #111111', textAlign: 'right', fontWeight: 700 }}>£ {order.total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Comments & Package contents block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid #EAEAEA', paddingTop: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              <strong style={{ fontSize: '0.85rem' }}>Comments / Notes:</strong>
            </div>
            
            {order.items.length > 0 && (
              <div>
                <strong style={{ textDecoration: 'underline' }}>**- Each Pack Has:</strong>
                <div style={{ marginTop: '0.35rem' }}>
                  {order.items.map((item, idx) => {
                    const pcs = deducePieces(item.variant_size);
                    const size = extractDimensions(item.variant_size);
                    return (
                      <div key={idx}>{pcs} Pcs {size}</div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Terms & Conditions list */}
          <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
            <strong>Terms & Conditions:</strong>
            <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: '0.5rem 0 0 0' }}>
              <li>- Delivery within 5-7 Days</li>
              <li>- Dispatch of order is subject to receipt of cleared payment in full</li>
              <li>- Quotation valid for 7 days</li>
            </ul>
          </div>

          {/* Electronic Signature Disclaimer */}
          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#666666', fontStyle: 'italic', borderTop: '1px solid #EAEAEA', paddingTop: '1rem' }}>
            This is an electronically generated document and does not require a physical signature.
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          body, html {
            background-color: #FFFFFF !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-page-wrapper {
            padding: 0 !important;
            background-color: #FFFFFF !important;
            min-height: auto !important;
          }
          .container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-container {
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
          .invoice-table {
            border: 1px solid #111111 !important;
            border-collapse: collapse !important;
          }
          .invoice-table th, .invoice-table td {
            border: 1px solid #111111 !important;
            padding: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
