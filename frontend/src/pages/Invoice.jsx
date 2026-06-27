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
          </div>

          {/* Client & Quote Metadata Layout */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '0.85rem' }}>
            {/* Left Col: Customer details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '45%' }}>
              <div><strong>Customer:</strong> {order.customer_details.name.toUpperCase()}</div>
              <div style={{ marginTop: '0.2rem' }}><strong>Contact Person:</strong> {order.customer_details.name}</div>
              <div style={{ marginTop: '0.2rem' }}><strong>Phone:</strong> {order.customer_details.phone || '+44 7467 505748'}</div>
              <div style={{ marginTop: '0.8rem' }}><strong>Delivery Postcode:</strong> {matchedPostcode}</div>
            </div>

            {/* Right Col: Quote meta details structured as a key-value grid */}
            <div style={{ width: '45%', display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '0.5rem', alignContent: 'start' }}>
              <strong>Quote Number:</strong> <span>{order.id}</span>
              <strong>Quote Date:</strong> <span>{quoteDate.toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
              <strong>Expiry Date:</strong> <span>{expiryDate.toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
              
              <strong style={{ marginTop: '0.8rem' }}>Sender:</strong>
              <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column' }}>
                <span>Roopesh Kapur</span>
                <span style={{ fontSize: '0.75rem', color: '#555555' }}>(Director)</span>
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
              
              {/* Empty padding spreadsheet rows matching user image exactly (only if more than 1 item) */}
              {order.items.length > 1 && Array.from({ length: 2 }).map((_, idx) => (
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

          {/* Comments & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #EAEAEA', paddingTop: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <strong style={{ fontSize: '0.85rem' }}>Comments / Notes:</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#555555', lineHeight: 1.5 }}>
              Please inspect material specifications and delivery outcodes upon receipt. For dispatch scheduling or related queries, kindly reference your Quote/Invoice Number.
            </p>
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

          {/* Center-Aligned Company Footer Details */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.7rem', color: '#777777', lineHeight: 1.5, borderTop: '1px solid #F0ECE6', paddingTop: '1rem' }}>
            Registered Office: Twelve Quays House, Egerton Wharf, Wirral, United Kingdom, CH41 1LD<br />
            Website: www.jmdglobalstones.co.uk | Email: sales@jmdglobalstones.co.uk | Phone: 07450 148506<br />
            Company House No.: 12807959 | VAT No.: GB 358688337
          </div>

        </div>
      </div>

      <style>{`
        @page {
          size: auto;
          margin: 0mm; /* Disables default browser header (title/date) and footer (URL/page numbers) */
        }
        
        @media print {
          /* Hide everything on the page */
          body * {
            visibility: hidden !important;
          }
          
          /* Only show the invoice container and its children */
          .print-container, .print-container * {
            visibility: visible !important;
          }
          
          /* Position print container at top left and add physical page padding */
          .print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            padding: 1.5cm 1.5cm 1cm 1.5cm !important; /* Emulates page margins */
            margin: 0 !important;
            font-size: 10.5px !important; /* Scale down fonts to guarantee 1-page fit */
            line-height: 1.35 !important;
          }
          
          .print-container img {
            height: 48px !important; /* Scale down logo */
          }

          .invoice-table {
            border: 1px solid #111111 !important;
            border-collapse: collapse !important;
            margin-bottom: 0.85rem !important;
          }
          
          .invoice-table th, .invoice-table td {
            border: 1px solid #111111 !important;
            padding: 0.35rem !important; /* Tighter cell padding */
            font-size: 9.5px !important;
          }
          
          /* Hide navigation bar */
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
