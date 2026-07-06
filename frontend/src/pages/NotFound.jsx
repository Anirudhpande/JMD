import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  useEffect(() => {
    document.title = "404 Page Not Found | JMD Global Stones";
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '10rem 0', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-accent)', marginBottom: '1.5rem', display: 'block' }}>
          Error 404
        </span>
        <h1 style={{ fontSize: '4.5rem', fontFamily: 'var(--font-heading)', fontWeight: 400, color: 'var(--text-on-light)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-muted-on-light)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '3rem', maxWidth: '480px', margin: '0 auto 3rem auto' }}>
          The architectural coordinates you requested do not map to any active paving slabs, project galleries, or stone registries in our warehouse catalog.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
            View Materials <ArrowRight size={15} />
          </Link>
          <Link to="/" className="btn btn-secondary">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
