import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Building, Truck, AlertCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUYER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await register(name, email, password, role);
      if (newUser.role === 'BUYER') {
        navigate('/buyer/dashboard');
      } else {
        navigate('/supplier/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2.5rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="card-body" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <UserPlus size={24} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Create an Account
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Select your role and start transacting on the B2B RFQ Marketplace
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">I want to join as a:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div
                  onClick={() => setRole('BUYER')}
                  style={{
                    border: `2px solid ${role === 'BUYER' ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    cursor: 'pointer',
                    backgroundColor: role === 'BUYER' ? 'var(--primary-light)' : '#ffffff',
                    transition: 'var(--transition)',
                    textAlign: 'center',
                  }}
                >
                  <Building size={24} style={{ color: role === 'BUYER' ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '0.35rem' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: role === 'BUYER' ? 'var(--primary-dark)' : 'var(--text-main)' }}>
                    Buyer
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Post RFQs & source goods
                  </div>
                </div>

                <div
                  onClick={() => setRole('SUPPLIER')}
                  style={{
                    border: `2px solid ${role === 'SUPPLIER' ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    cursor: 'pointer',
                    backgroundColor: role === 'SUPPLIER' ? 'var(--primary-light)' : '#ffffff',
                    transition: 'var(--transition)',
                    textAlign: 'center',
                  }}
                >
                  <Truck size={24} style={{ color: role === 'SUPPLIER' ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '0.35rem' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: role === 'SUPPLIER' ? 'var(--primary-dark)' : 'var(--text-main)' }}>
                    Supplier
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Browse RFQs & submit quotes
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name / Company Name
              </label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="e.g. Acme Corporation or Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Work Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password (min 6 characters)
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block"
              style={{ padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.75rem' }}
            >
              {loading ? 'Creating account...' : `Register as ${role === 'BUYER' ? 'Buyer' : 'Supplier'}`}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
