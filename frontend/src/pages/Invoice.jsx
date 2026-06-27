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

  return (
    <div className="invoice-page-wrapper" style={{ backgroundColor: '#FDFCFA', padding: '4rem 0', minHeight: '100vh' }}>
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
        <div className="print-container" style={{ border: '1px solid #111111', padding: '3.5rem', backgroundColor: '#FFFFFF', color: '#111111' }}>
          
          {/* Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111111', paddingBottom: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <img src="/logo.png" alt="JMD Global Stones Logo" style={{ height: '56px', objectFit: 'contain' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.5rem', lineHeight: 1.5 }}>
                JMD Global Stones Pvt Ltd<br />
                Company No: 12807959 | VAT No: GB 358688337<br />
                Headquarters: Twelve Quays House, Egerton Wharf, CH41 1LD<br />
                Southampton Yard: Yard 2, Eling Wharf, SO40 4TE
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontWeight: 600 }}>
                Tax Invoice
              </h2>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem' }}>Invoice #: INV-{order.id}</p>
              <p style={{ fontSize: '0.85rem', color: '#666666' }}>Date: {new Date(order.created_at).toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {/* Client & Shipping Metadata */}
          <div className="invoice-metadata" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '3rem' }}>
            <div>
              <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #111111', paddingBottom: '0.35rem', marginBottom: '0.85rem', fontWeight: 700 }}>Invoiced To:</h3>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{order.customer_details.name}</p>
              <p style={{ fontSize: '0.85rem', color: '#444444', lineHeight: 1.5 }}>{order.customer_details.address}</p>
              <p style={{ fontSize: '0.85rem', color: '#444444', marginTop: '0.5rem' }}>Email: {order.customer_details.email}</p>
              <p style={{ fontSize: '0.85rem', color: '#444444' }}>Phone: {order.customer_details.phone}</p>
            </div>
            <div>
              <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #111111', paddingBottom: '0.35rem', marginBottom: '0.85rem', fontWeight: 700 }}>Payment Info:</h3>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.35rem 0', color: '#666666', fontWeight: 500 }}>Payment Method:</td>
                    <td style={{ padding: '0.35rem 0', textAlign: 'right', fontWeight: 600 }}>{order.payment_method === 'stripe' ? 'Stripe Card Element' : 'Bank Transfer'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.35rem 0', color: '#666666', fontWeight: 500 }}>Payment Status:</td>
                    <td style={{ padding: '0.35rem 0', textAlign: 'right', fontWeight: 600, textTransform: 'uppercase', color: order.payment_status === 'paid' ? '#2E7D32' : '#C62828' }}>
                      {order.payment_status}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.35rem 0', color: '#666666', fontWeight: 500 }}>Fulfillment Status:</td>
                    <td style={{ padding: '0.35rem 0', textAlign: 'right', fontWeight: 600, textTransform: 'uppercase' }}>
                      {order.status}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Items Table */}
          <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem', fontSize: '0.85rem', border: '1px solid #111111' }}>
            <thead>
              <tr style={{ backgroundColor: '#EBE4D9', borderBottom: '2px solid #111111' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid #111111', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid #111111', textAlign: 'center' }}>Size (mm)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid #111111', textAlign: 'center' }}>Thickness</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid #111111', textAlign: 'center' }}>Qty (packs)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid #111111', textAlign: 'center' }}>Coverage / Pack (m²)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid #111111', textAlign: 'center' }}>Total Coverage (m²)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid #111111', textAlign: 'right' }}>Rate (£/m²)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid #111111', textAlign: 'right' }}>Line Total (£)</th>
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
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500, border: '1px solid #111111' }}>{item.product_name}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#555555', border: '1px solid #111111' }}>{size}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#555555', border: '1px solid #111111' }}>{thickness}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', border: '1px solid #111111' }}>{qty}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#555555', border: '1px solid #111111' }}>{coverage.toFixed(1)}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#555555', border: '1px solid #111111' }}>{totalCoverage}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right', border: '1px solid #111111' }}>£{rate}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 500, border: '1px solid #111111' }}>£{parseFloat(lineTotal).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Summary Breakdown */}
          <div className="invoice-summary" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <table style={{ width: '100%', maxWidth: '380px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #EAEAEA' }}>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#555555' }}>Subtotal (ex. VAT)</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 500 }}>£{order.subtotal.toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EAEAEA' }}>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#555555' }}>Carriage / Shipping</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 500 }}>£{order.shipping.toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EAEAEA' }}>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#555555' }}>VAT (20%)</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 500 }}>£{order.vat.toFixed(2)}</td>
                </tr>
                <tr style={{ borderTop: '2px solid #111111', fontSize: '1.15rem' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>Invoice Total</td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>£{order.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Invoice Footer */}
          <div className="invoice-footer" style={{ marginTop: '5rem', borderTop: '1px solid #EAEAEA', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#777777', lineHeight: 1.5 }}>
            <p style={{ marginBottom: '0.5rem' }}>If you have any questions concerning this invoice, contact our billing office at billing@jmdglobalstones.co.uk.</p>
            <strong style={{ color: '#111111' }}>Thank you for your business.</strong>
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
            padding: 1.5rem !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
          }
          .invoice-metadata {
            margin-bottom: 1.5rem !important;
          }
          .invoice-table {
            border: 1px solid #111111 !important;
            border-collapse: collapse !important;
            margin-bottom: 1.5rem !important;
          }
          .invoice-table th, .invoice-table td {
            border: 1px solid #111111 !important;
            padding: 0.65rem 0.5rem !important;
          }
          .invoice-footer {
            margin-top: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
