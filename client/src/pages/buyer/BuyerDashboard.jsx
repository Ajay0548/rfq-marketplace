import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  MessageSquareQuote, 
  PlusCircle, 
  ArrowRight,
  MapPin,
  Calendar
} from 'lucide-react';

export default function BuyerDashboard() {
  const [stats, setStats] = useState(null);
  const [recentRfqs, setRecentRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, rfqsRes] = await Promise.all([
        api.get('/buyer/dashboard'),
        api.get('/buyer/rfqs'),
      ]);
      setStats(statsRes.data);
      setRecentRfqs(rfqsRes.data.slice(0, 5)); // Take first 5 for recent activity
    } catch (err) {
      setError(err.message || 'Failed to load buyer dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading buyer dashboard..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Buyer Procurement Dashboard</h1>
          <p className="page-subtitle">
            Overview of your Requests for Quotation (RFQs) and supplier proposals
          </p>
        </div>
        <Link to="/buyer/rfqs/create" className="btn btn-primary">
          <PlusCircle size={18} /> Create New RFQ
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="stat-grid">
        <StatCard
          label="Total RFQs"
          value={stats?.totalRfqs || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Active / Open RFQs"
          value={stats?.openRfqs || 0}
          icon={Clock}
          color="emerald"
        />
        <StatCard
          label="Closed / Expired RFQs"
          value={stats?.closedRfqs || 0}
          icon={CheckCircle2}
          color="amber"
        />
        <StatCard
          label="Total Quotes Received"
          value={stats?.totalQuotations || 0}
          icon={MessageSquareQuote}
          color="purple"
        />
      </div>

      {/* Recent RFQs Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent RFQs</h2>
          <Link to="/buyer/rfqs" className="btn btn-sm btn-outline">
            View All RFQs <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {recentRfqs.length === 0 ? (
            <div style={{ padding: '2rem' }}>
              <EmptyState
                title="No RFQs Created Yet"
                description="Create your first Request for Quotation to start receiving competitive bids from suppliers."
                actionLabel="Create RFQ"
                actionLink="/buyer/rfqs/create"
              />
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product / Service</th>
                    <th>Quantity</th>
                    <th>Delivery Location</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Quotations</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRfqs.map((rfq) => (
                    <tr key={rfq.id}>
                      <td>
                        <Link to={`/buyer/rfqs/${rfq.id}`} style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {rfq.productName}
                        </Link>
                      </td>
                      <td>{rfq.quantity.toLocaleString()} units</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                          <MapPin size={14} /> {rfq.deliveryLocation}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                          <Calendar size={14} /> {new Date(rfq.deadline).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={rfq.effectiveStatus} />
                      </td>
                      <td>
                        <Link
                          to={`/buyer/rfqs/${rfq.id}/quotations`}
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '0.8125rem' }}
                        >
                          <MessageSquareQuote size={14} /> {rfq.quotationCount} Quotes
                        </Link>
                      </td>
                      <td>
                        <Link to={`/buyer/rfqs/${rfq.id}`} className="btn btn-sm btn-secondary">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
