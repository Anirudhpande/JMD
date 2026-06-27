import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../api.js';

const extractCoverage = (v) => {
  const m = String(v || '').match(/(\d+(\.\d+)?)\s*m²/i);
  return m ? parseFloat(m[1]) : 18.9;
};
const extractDimensions = (v) => {
  const m = String(v || '').match(/\d+x\d+/);
  return m ? m[0] : 'Mixed';
};
const deduceThickness = (name) => {
  const n = String(name || '').toLowerCase();
  if (n.includes('porcelain')) return '20mm';
  if (n.includes('brick'))    return '65mm';
  return '22mm';
};
const deducePieces = (v) => {
  const m = String(v || '').match(/(\d+)\s*Pcs/i);
  if (m) return parseInt(m[1]);
  const s = String(v || '').toLowerCase();
  if (s.includes('30')) return 30;
  if (s.includes('40')) return 40;
  return 38;
};
const fmtNum = (n) =>
  Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Strip the " - 900x600mm Pack 30 Pieces (Single Size)" style suffix from product names
const cleanProductName = (name) =>
  String(name || '').replace(/\s*-\s*\d+x\d+.*$/i, '').trim();

export default function Invoice() {
  const { orderId } = useParams();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          const o = {
            ...data,
            subtotal: Number(data.subtotal || 0),
            vat:      Number(data.vat      || 0),
            shipping: Number(data.shipping || 0),
            total:    Number(data.total    || 0),
            customer_details:
              typeof data.customer_details === 'string'
                ? JSON.parse(data.customer_details)
                : (data.customer_details || {}),
            items:
              typeof data.items === 'string'
                ? JSON.parse(data.items)
                : (data.items || []),
          };
          setOrder(o);
          document.title = `Quote ${o.id} | JMD Global Stones`;
        } else {
          setError('Invoice not found.');
        }
      } catch {
        setError('Network error.');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading)
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading invoice…</p>
      </div>
    );

  if (error || !order)
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid #c00' }}>
          <AlertTriangle size={32} style={{ color: '#c00', marginBottom: '1rem' }} />
          <p>{error || 'Could not load invoice.'}</p>
          <Link to="/">Return Home</Link>
        </div>
      </div>
    );

  const cd         = order.customer_details;
  const quoteDate  = new Date(order.created_at);
  const expiryDate = new Date(order.created_at);
  expiryDate.setDate(expiryDate.getDate() + 7);
  const fmtDate    = (d) => d.toLocaleDateString('en-GB').replace(/\//g, '-');

  const postcodeMatch = (cd.address || '').match(/[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z]{2}/i);
  const postcode      = postcodeMatch ? postcodeMatch[0].toUpperCase() : '';

  const C = (extra = {}) => ({ padding: '5px 8px', ...extra });

  return (
    <>
      {/* Screen-only nav */}
      <div className="no-print" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 2rem', borderBottom:'1px solid #ddd', background:'#fff' }}>
        <Link to={order.user_id !== 'guest' ? '/account' : '/'} style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.85rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em', color:'#333' }}>
          <ArrowLeft size={15}/> Return to Account
        </Link>
        <button
          onClick={() => {
            const prev = document.title;
            document.title = '';
            window.print();
            document.title = prev;
          }}
          style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 1.25rem', background:'#222', color:'#fff', border:'none', cursor:'pointer', fontSize:'0.85rem', fontWeight:600 }}
        >
          <Printer size={15}/> Print Invoice
        </button>
      </div>

      {/* ══════════ PRINTABLE INVOICE ══════════ */}
      <div className="print-container" style={{ fontFamily:'Arial,Helvetica,sans-serif', fontSize:'12px', color:'#000', background:'#fff', maxWidth:'800px', margin:'2rem auto', padding:'2rem 2.5rem', lineHeight:1.45 }}>

        {/* HEADER: Logo centred */}
        <div style={{ textAlign:'center', marginBottom:'6px' }}>
          <img src="/logo.png" alt="JMD Global Stones" style={{ height:'62px', objectFit:'contain' }}/>
        </div>

        {/* HEADER: Company address centred */}
        <div style={{ textAlign:'center', fontSize:'10.5px', color:'#333', lineHeight:1.65, marginBottom:'16px' }}>
          Registered Office: Twelve Quays House, Egerton Wharf, Wirral, United Kingdom, CH41 1LD<br/>
          Website: www.jmdglobalstones.co.uk &nbsp;|&nbsp; Email: sales@jmdglobalstones.co.uk &nbsp;|&nbsp; Phone: 07458 148586<br/>
          Company House No.: 12807959 &nbsp;|&nbsp; VAT No.: GB 358688337
        </div>

        <hr style={{ border:'none', borderTop:'1px solid #ccc', margin:'0 0 16px 0' }}/>

        {/* META: two-column table */}
        <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'18px', fontSize:'12px' }}>
          <tbody>
            <tr>
              <td style={{ width:'35%', padding:'0 0 7px 0', fontWeight:'bold', verticalAlign:'top' }}>
                Customer:&nbsp;<span style={{ fontWeight:'normal' }}>{(cd.name || '').toUpperCase()}</span>
              </td>
              <td style={{ width:'5%' }}/>
              <td style={{ width:'22%', padding:'0 0 7px 0', fontWeight:'bold', verticalAlign:'top' }}>Quote Number:</td>
              <td style={{ width:'38%', padding:'0 0 7px 0', verticalAlign:'top' }}>{order.id}</td>
            </tr>
            <tr>
              <td style={{ padding:'0 0 7px 0', fontWeight:'bold', verticalAlign:'top' }}>
                Contact Person:&nbsp;<span style={{ fontWeight:'normal' }}>{cd.name || ''}</span>
              </td>
              <td/>
              <td style={{ padding:'0 0 7px 0', fontWeight:'bold', verticalAlign:'top' }}>Quote Date:</td>
              <td style={{ padding:'0 0 7px 0', verticalAlign:'top' }}>{fmtDate(quoteDate)}</td>
            </tr>
            <tr>
              <td style={{ padding:'0 0 14px 0', fontWeight:'bold', verticalAlign:'top' }}>
                Phone:&nbsp;<span style={{ fontWeight:'normal' }}>{cd.phone || ''}</span>
              </td>
              <td/>
              <td style={{ padding:'0 0 7px 0', fontWeight:'bold', verticalAlign:'top' }}>Expiry Date:</td>
              <td style={{ padding:'0 0 7px 0', verticalAlign:'top' }}>{fmtDate(expiryDate)}</td>
            </tr>
            <tr>
              <td style={{ padding:'0 0 7px 0', fontWeight:'bold', verticalAlign:'top' }}>
                Delivery Postcode:&nbsp;<span style={{ fontWeight:'normal' }}>{postcode}</span>
              </td>
              <td/>
              <td style={{ padding:'0 0 7px 0', fontWeight:'bold', verticalAlign:'top' }}>Sender:</td>
              <td style={{ padding:'0 0 7px 0', verticalAlign:'top' }}>
                Roopesh Kapur &nbsp;&nbsp; (Director)
              </td>
            </tr>
          </tbody>
        </table>

        {/* ITEMS TABLE */}
        <table className="invoice-table" style={{ width:'100%', borderCollapse:'collapse', border:'1px solid #000', marginBottom:'14px', fontSize:'11px' }}>
          <thead>
            <tr style={{ background:'#d9d9d9', borderBottom:'1px solid #000' }}>
              <th style={{ ...C({ textAlign:'center', width:'26%', borderRight:'1px solid #000' }) }}>Description</th>
              <th style={{ ...C({ textAlign:'center', width:'10%', borderRight:'1px solid #000' }) }}>Size (mm)</th>
              <th style={{ ...C({ textAlign:'center', width:'9%',  borderRight:'1px solid #000' }) }}>Thickness</th>
              <th style={{ ...C({ textAlign:'center', width:'8%',  borderRight:'1px solid #000' }) }}>Qty<br/>(packs)</th>
              <th style={{ ...C({ textAlign:'center', width:'12%', borderRight:'1px solid #000' }) }}>Coverage<br/>/ Pack in<br/>m²</th>
              <th style={{ ...C({ textAlign:'center', width:'12%', borderRight:'1px solid #000' }) }}>Total coverage<br/>in m²</th>
              <th style={{ ...C({ textAlign:'center', width:'11%', borderRight:'1px solid #000' }) }}>Rate (£/m²)</th>
              <th style={{ ...C({ textAlign:'center', width:'12%' }) }}>Line Total<br/>(£)</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => {
              const size      = extractDimensions(item.variant_size);
              const thick     = deduceThickness(cleanProductName(item.product_name));
              const qty       = item.quantity;
              const cov       = extractCoverage(item.variant_size);
              const totCov    = (cov * qty).toFixed(1);
              const rate      = (parseFloat(item.price) / cov).toFixed(2);
              const lineTotal = (parseFloat(item.price) * qty).toFixed(2);
              return (
                <tr key={i} style={{ borderBottom:'1px solid #ddd' }}>
                  <td style={C({ textAlign:'left' })}>{cleanProductName(item.product_name)}</td>
                  <td style={C({ textAlign:'center' })}>{size}</td>
                  <td style={C({ textAlign:'center' })}>{thick}</td>
                  <td style={C({ textAlign:'center' })}>{qty}</td>
                  <td style={C({ textAlign:'center' })}>{cov.toFixed(1)}</td>
                  <td style={C({ textAlign:'center' })}>{totCov}</td>
                  <td style={C({ textAlign:'center' })}>£ &nbsp;{rate}</td>
                  <td style={C({ textAlign:'right' })}>£ &nbsp;{fmtNum(lineTotal)}</td>
                </tr>
              );
            })}
            {/* Blank row 1 */}
            <tr style={{ height:'22px' }}>
              {[0,1,2,3,4,5,6].map(i=><td key={i} style={{ padding:'5px 8px' }}/>)}
              <td style={{ padding:'5px 8px' }}/>
            </tr>
            {/* Blank row 2 — shows £ - */}
            <tr style={{ height:'22px' }}>
              {[0,1,2,3,4,5,6].map(i=><td key={i} style={{ padding:'5px 8px' }}/>)}
              <td style={{ padding:'5px 8px', textAlign:'right', color:'#555' }}>£ &nbsp;-</td>
            </tr>
          </tbody>
        </table>

        {/* TOTALS TABLE */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'20px' }}>
          <table style={{ borderCollapse:'collapse', fontSize:'11px', border:'1px solid #000' }}>
            <tbody>
              {[
                ['Sub Total',    `£  ${fmtNum(order.subtotal)}`],
                ['Delivery',     order.shipping > 0 ? `£  ${fmtNum(order.shipping)}` : '£'],
                ['VAT @ 20%',   `£  ${fmtNum(order.vat)}`],
                ['Total Payable',`£  ${fmtNum(order.total)}`],
              ].map(([label, val], i) => (
                <tr key={i}>
                  <td style={{ padding:'4px 14px 4px 8px', textAlign:'right', fontWeight:'bold', minWidth:'110px', borderBottom: i < 3 ? '1px solid #ddd' : 'none' }}>{label}</td>
                  <td style={{ padding:'4px 8px', textAlign:'right', minWidth:'90px', fontWeight: label === 'Total Payable' ? 'bold' : 'normal', borderBottom: i < 3 ? '1px solid #ddd' : 'none' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* COMMENTS / NOTES */}
        <div style={{ marginBottom:'10px' }}>
          <strong>Comments / Notes:</strong>
        </div>

        {/* Each Pack Has */}
        <div style={{ marginBottom:'18px' }}>
          <div><strong><u>**- Each Pack Has:</u></strong></div>
          {order.items.map((item, i) => (
            <div key={i}>{deducePieces(item.variant_size)} Pcs {extractDimensions(item.variant_size)}</div>
          ))}
        </div>

        {/* TERMS */}
        <div style={{ fontSize:'12px', lineHeight:1.7 }}>
          <strong>Terms &amp; Conditions:</strong>
          <div style={{ marginTop:'4px' }}>
            <div>- Delivery within 5-7 Days</div>
            <div>- Dispatch of order is subject to receipt of cleared payment in full</div>
            <div>- Quotation valid for 7 days</div>
          </div>
        </div>

        {/* DIGITAL DISCLAIMER */}
        <div style={{ marginTop:'2.5rem', textAlign:'center', fontSize:'10px', color:'#888', fontStyle:'italic' }}>
          This is a digitally generated document and does not require a physical signature.
        </div>

      </div>

      <style>{`
        @page {
          size: A4;
          margin: 10mm 12mm;
        }
        @media print {
          .no-print { display: none !important; }

          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * { visibility: hidden; }

          .print-container,
          .print-container * { visibility: visible; }

          .print-container {
            position: fixed;
            inset: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0 10mm !important;
            font-size: 10px !important;
            line-height: 1.35 !important;
            max-width: 100% !important;
            box-sizing: border-box;
          }

          .print-container img { height: 44px !important; }

          .invoice-table th,
          .invoice-table td {
            padding: 3px 4px !important;
            font-size: 8.5px !important;
          }
        }
      `}</style>
    </>
  );
}
