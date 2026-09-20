import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import { 
  Search, 
  Send, 
  DollarSign, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Package, 
  Building 
} from 'lucide-react';

export default function SupplierDashboard() {
  const [stats, setStats] = useState(null);
  const [availableRfqs, setAvailableRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, rfqsRes] = await Promise.all([
        api.get('/supplier/dashboard'),
        api.get('/rfqs?status=OPEN'), // Only open active RFQs
      ]);
      setStats(statsRes.data);
      setAvailableRfqs(rfqsRes.data.slice(0, 4));
    } catch (err) {
      setError(err.message || 'Failed to load supplier dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading supplier dashboard..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Supplier Bidding Dashboard</h1>
          <p className="page-subtitle">
            Browse live buyer procurement demands, submit quotations, and track active bids
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/supplier/quotations" className="btn btn-outline">
            <Send size={16} /> My Quotations
          </Link>
          <Link to="/supplier/rfqs" className="btn btn-primary">
            <Search size={16} /> Browse All RFQs
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="stat-grid">
        <StatCard
          label="My Submitted Quotes"
          value={stats?.myQuotationsCount || 0}
          icon={Send}
          color="blue"
        />
        <StatCard
          label="Open Marketplace RFQs"
          value={stats?.activeRfqsCount || 0}
          icon={Search}
          color="emerald"
        />
        <StatCard
          label="Total Value Quoted"
          value={`₹${Number(stats?.totalQuotedValue || 0).toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Latest RFQs Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Live Procurement Opportunities</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Recently posted buyer RFQs currently accepting quotations
            </p>
          </div>
          <Link to="/supplier/rfqs" className="btn btn-sm btn-outline">
            View All Open RFQs <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card-body">
          {availableRfqs.length === 0 ? (
            <EmptyState
              title="No Active RFQs Right Now"
              description="There are currently no open buyer RFQs available for quotation."
            />
          ) : (
            <div className="rfq-grid">
              {availableRfqs.map((rfq) => (
                <div key={rfq.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <StatusBadge status={rfq.effectiveStatus} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Deadline: {new Date(rfq.deadline).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      {rfq.productName}
                    </h3>

                    <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rfq.description}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Package size={14} color="var(--primary)" />
                        <span>Quantity: <strong>{rfq.quantity.toLocaleString()} units</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} color="var(--primary)" />
                        <span>Location: {rfq.deliveryLocation}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building size={14} color="var(--primary)" />
                        <span>Buyer: {rfq.buyer?.name}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                      <Link to={`/supplier/rfqs/${rfq.id}`} className="btn btn-primary btn-block btn-sm">
                        View RFQ & Submit Quote
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
