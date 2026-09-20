import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  const { role, isAuthenticated } = useAuth();

  const targetPath = role === 'BUYER' ? '/buyer/dashboard' : '/supplier/dashboard';

  return (
    <div style={{ maxWidth: '520px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <ShieldAlert size={32} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Access Forbidden
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          You do not have the required permissions to access this page. This section is restricted to other user roles.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <Link to={targetPath} className="btn btn-primary">
              <ArrowLeft size={16} /> Return to Your Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
