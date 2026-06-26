import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Check, AlertTriangle } from 'lucide-react';

export default function Invoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
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
    <div style={{ backgroundColor: '#FDFCFA', padding: '4rem 0', minHeight: '100vh' }}>
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
              <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.02em', textTransform: 'uppercase', margin: 0 }}>
                JMD Global Stones
              </h1>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '3rem' }}>
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
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #111111', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>Product Description</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>Size Specification</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Unit Price (ex. VAT)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Line Total (ex. VAT)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #EAEAEA' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{item.product_name}</td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#555555' }}>{item.variant_size}</td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>£{parseFloat(item.price).toFixed(2)}</td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 500 }}>£{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Breakdown */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <table style={{ width: '100%', maxWidth: '380px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #EAEAEA' }}>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#555555' }}>Subtotal (ex. VAT)</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 500 }}>£{order.subtotal.toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EAEAEA' }}>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#555555' }}>VAT (20%)</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 500 }}>£{order.vat.toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EAEAEA' }}>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#555555' }}>Carriage / Shipping</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 500 }}>£{order.shipping.toFixed(2)}</td>
                </tr>
                <tr style={{ borderTop: '2px solid #111111', fontSize: '1.15rem' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>Invoice Total</td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>£{order.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Invoice Footer */}
          <div style={{ marginTop: '5rem', borderTop: '1px solid #EAEAEA', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#777777', lineHeight: 1.5 }}>
            <p style={{ marginBottom: '0.5rem' }}>If you have any questions concerning this invoice, contact our billing office at billing@jmdglobalstones.co.uk.</p>
            <strong style={{ color: '#111111' }}>Thank you for your business.</strong>
          </div>

        </div>

      </div>
    </div>
  );
}
