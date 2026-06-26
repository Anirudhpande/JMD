import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar } from 'lucide-react';

export default function Account({ user, onLogout }) {
  useEffect(() => {
    document.title = "My Account | JMD Global Stones";
  }, []);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        const customerOrders = data.filter(o => o.user_id === user.id);
        setOrders(customerOrders);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching customer orders:', err);
        setLoading(false);
      });
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return { border: 'var(--color-accent)', text: 'var(--color-accent)' };
      case 'shipped': return { border: '#2B82D9', text: '#2B82D9' };
      case 'delivered': return { border: 'var(--color-success)', text: 'var(--color-success)' };
      default: return { border: 'var(--color-border-light)', text: 'var(--text-on-light)' };
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '6rem 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '2rem' }}>
          <div>
            <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em' }}>Customer Portal</span>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', marginTop: '0.5rem', fontWeight: 400 }}>My Account</h1>
          </div>
          <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            Sign Out
          </button>
        </div>

        {/* Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3.5rem' }} className="account-layout">
          
          {/* Left Column: Profile Card */}
          <div>
            <div style={{ border: '1px solid var(--color-border-light)', padding: '2.5rem 2rem', height: 'fit-content', backgroundColor: 'transparent' }}>
              <h3 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1.75rem', fontWeight: 600, borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.75rem' }}>
                Profile Settings
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted-on-light)', marginBottom: '0.25rem' }}>Full Name</label>
                  <p style={{ fontWeight: 500, color: 'var(--text-on-light)' }}>{user.name}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted-on-light)', marginBottom: '0.25rem' }}>Email Address</label>
                  <p style={{ fontWeight: 500, color: 'var(--text-on-light)' }}>{user.email}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted-on-light)', marginBottom: '0.25rem' }}>Phone Number</label>
                  <p style={{ fontWeight: 500, color: 'var(--text-on-light)' }}>{user.phone || 'N/A'}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted-on-light)', marginBottom: '0.25rem' }}>Account Role</label>
                  <p style={{ fontWeight: 500, textTransform: 'capitalize', color: 'var(--text-on-light)' }}>{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order History */}
          <div>
            <h3 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1.75rem', fontWeight: 600 }}>
              Order History
            </h3>

            {loading ? (
              <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.9rem' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ border: '1px solid var(--color-border-light)', padding: '5rem 2rem', textAlign: 'center', backgroundColor: 'transparent' }}>
                <Package size={36} style={{ color: 'var(--color-accent)', marginBottom: '1.5rem', strokeWidth: 1.5 }} />
                <p style={{ color: 'var(--text-muted-on-light)', marginBottom: '2.25rem', fontSize: '0.95rem' }}>You haven't placed any stone orders yet.</p>
                <Link to="/products" className="btn btn-primary">Browse Slabs</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {orders.map((order) => {
                  const statusColors = getStatusColor(order.status);
                  return (
                    <div key={order.id} style={{ border: '1px solid var(--color-border-light)', padding: '2.5rem 2rem', backgroundColor: 'transparent' }}>
                      
                      {/* Order Title Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }} className="order-header-row">
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Number</span>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 500, fontFamily: 'var(--font-body)', color: 'var(--text-on-light)' }}>#{order.id}</h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Placed On</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-on-light)' }}>
                            <Calendar size={14} style={{ color: 'var(--color-accent)' }} /> {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-on-light)' }}>
                            <span>
                              {item.product_name} <span style={{ color: 'var(--text-muted-on-light)', fontSize: '0.8rem' }}>({item.variant_size})</span> x {item.quantity}
                            </span>
                            <span style={{ fontWeight: 600 }}>£{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Summary & Status Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EBE4D9', padding: '1.25rem 1.5rem', border: '1px solid var(--color-border-light)' }} className="order-summary-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted-on-light)' }}>Status:</span>
                          <span style={{ border: `1px solid ${statusColors.border}`, color: statusColors.text, fontSize: '0.7rem', textTransform: 'uppercase', padding: '0.25rem 0.6rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                            {order.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-accent)' }}>
                          Total: £{order.total.toFixed(2)}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .account-layout { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .order-header-row, .order-summary-row { flex-direction: column; align-items: flex-start !important; gap: 1rem; }
          .order-header-row div { text-align: left !important; }
        }
      `}</style>
    </div>
  );
}
