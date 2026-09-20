import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, ShoppingBag, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    return role === 'BUYER' ? (
      <Navigate to="/buyer/dashboard" replace />
    ) : (
      <Navigate to="/supplier/dashboard" replace />
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '3.5rem 1rem 2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          <ShieldCheck size={16} /> Enterprise B2B Request For Quotation Platform
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', lineHeight: 1.2, maxWidth: '750px', margin: '0 auto' }}>
          Streamlined B2B Sourcing & Quotation Marketplace
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '1rem auto 2rem', lineHeight: 1.6 }}>
          Connect commercial buyers with vetted suppliers. Post custom RFQs, receive verified price bids, and award procurement contracts faster.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            Sign In to Marketplace <ArrowRight size={18} />
          </Link>
          <Link to="/register" className="btn btn-outline" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            Create New Account
          </Link>
        </div>
      </div>

      {/* Two Roles Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', marginTop: '2rem' }}>
        {/* Buyer Card */}
        <div className="card">
          <div className="card-body" style={{ padding: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShoppingBag size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              For Buyers
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Create detailed Requests for Quotations with custom specifications, quantities, delivery deadlines, and review competing supplier offers in real time.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: 'var(--secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>✓ Post custom RFQs with quantity and deadline</li>
              <li>✓ Manage procurement pipeline on a single dashboard</li>
              <li>✓ Compare quotes side-by-side by price & delivery</li>
            </ul>
            <Link to="/login" className="btn btn-outline btn-block">
              Login as Buyer
            </Link>
          </div>
        </div>

        {/* Supplier Card */}
        <div className="card">
          <div className="card-body" style={{ padding: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Truck size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              For Suppliers
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Discover commercial procurement leads across India. Filter by delivery destination, review technical requirements, and submit competitive proposals.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: 'var(--secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>✓ Search open buyer RFQs by keyword and location</li>
              <li>✓ Submit direct bids with delivery schedules and notes</li>
              <li>✓ Track status of all your submitted proposals</li>
            </ul>
            <Link to="/login" className="btn btn-outline btn-block">
              Login as Supplier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
