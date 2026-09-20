import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <FileQuestion size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Page Not Found (404)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          The page you requested could not be located or may have been moved.
        </p>

        <Link to="/" className="btn btn-primary">
          <Home size={16} /> Return Home
        </Link>
      </div>
    </div>
  );
}
