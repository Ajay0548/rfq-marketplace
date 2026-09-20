import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import { 
  Send, 
  Search, 
  Truck, 
  MessageSquare, 
  Calendar, 
  ExternalLink,
  MapPin,
  Package
} from 'lucide-react';

export default function MyQuotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchQuotations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/supplier/quotations');
      setQuotations(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch submitted quotations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const filtered = quotations.filter((q) => {
    const term = search.toLowerCase();
    return (
      q.rfq.productName.toLowerCase().includes(term) ||
      (q.message && q.message.toLowerCase().includes(term)) ||
      q.estimatedDelivery.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Submitted Quotations</h1>
          <p className="page-subtitle">
            Track all proposals submitted to buyers across active and completed RFQs
          </p>
        </div>
        <Link to="/supplier/rfqs" className="btn btn-primary">
          <Search size={16} /> Browse New RFQs
        </Link>
      </div>

      {/* Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by product name or quote notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchQuotations} />}

      {loading ? (
        <LoadingSpinner message="Loading your submitted quotations..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No Matching Quotations' : 'No Quotations Submitted Yet'}
          description={
            search
              ? 'Try modifying your search filter.'
              : 'You have not submitted any quotations yet. Browse open marketplace RFQs to submit your first proposal.'
          }
          actionLabel={search ? 'Clear Search' : 'Browse Marketplace RFQs'}
          actionLink={search ? undefined : '/supplier/rfqs'}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>RFQ Product</th>
                <th>Quoted Price</th>
                <th>Estimated Delivery</th>
                <th>Supplier Message</th>
                <th>RFQ Status</th>
                <th>Submitted Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((quote) => (
                <tr key={quote.id}>
                  <td>
                    <Link
                      to={`/supplier/rfqs/${quote.rfq.id}`}
                      style={{ fontWeight: 600, color: 'var(--text-main)' }}
                    >
                      {quote.rfq.productName}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Buyer: {quote.rfq.buyerName} • {quote.rfq.quantity.toLocaleString()} units
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                      ₹{Number(quote.quotedPrice).toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--secondary)' }}>
                      <Truck size={14} color="var(--primary)" /> {quote.estimatedDelivery}
                    </span>
                  </td>
                  <td style={{ maxWidth: '280px' }}>
                    {quote.message ? (
                      <span
                        title={quote.message}
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.8125rem',
                          color: 'var(--secondary)',
                          lineHeight: 1.4,
                        }}
                      >
                        {quote.message}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.8125rem' }}>
                        No notes provided
                      </span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={quote.rfq.effectiveStatus} />
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      to={`/supplier/rfqs/${quote.rfq.id}`}
                      className="btn btn-sm btn-outline"
                      title="View RFQ"
                    >
                      <ExternalLink size={14} /> View RFQ
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
