import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Package, 
  Building, 
  Filter, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export default function BrowseRFQs() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('OPEN'); // Default to OPEN per requirement!

  const fetchRfqs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (locationFilter.trim()) params.append('location', locationFilter.trim());
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/rfqs?${params.toString()}`);
      setRfqs(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch RFQs.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search on inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRfqs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, locationFilter, statusFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setLocationFilter('');
    setStatusFilter('OPEN');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Marketplace RFQs</h1>
          <p className="page-subtitle">
            Find commercial procurement requests matching your inventory and submit quotations
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            {/* Search */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                Search Keyword
              </label>
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder="Product, spec, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Delivery Location Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                Delivery Location
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Hyderabad, Bengaluru..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                Status Filter
              </label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="OPEN">Open RFQs Only (Active)</option>
                <option value="CLOSED">Closed / Expired RFQs</option>
                <option value="ALL">All RFQs (Historical)</option>
              </select>
            </div>

            {/* Reset Button */}
            <div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-outline btn-block"
                style={{ height: '42px' }}
              >
                <RotateCcw size={14} /> Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchRfqs} />}

      {loading ? (
        <LoadingSpinner message="Searching available RFQs..." />
      ) : rfqs.length === 0 ? (
        <EmptyState
          title="No Matching RFQs Found"
          description={
            search || locationFilter || statusFilter !== 'OPEN'
              ? 'Try widening your search terms or selecting "All RFQs" in the status filter.'
              : 'There are currently no open buyer RFQs in the marketplace. Check back soon.'
          }
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="rfq-grid">
          {rfqs.map((rfq) => (
            <div
              key={rfq.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderTop: rfq.effectiveStatus === 'OPEN' ? '3px solid var(--primary)' : '3px solid #cbd5e1',
              }}
            >
              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <StatusBadge status={rfq.effectiveStatus} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Posted {new Date(rfq.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  <Link to={`/supplier/rfqs/${rfq.id}`} style={{ color: 'inherit' }}>
                    {rfq.productName}
                  </Link>
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '1.25rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                  {rfq.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', padding: '0.875rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8125rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                      <Package size={14} color="var(--primary)" /> Quantity:
                    </span>
                    <strong style={{ color: 'var(--text-main)' }}>{rfq.quantity.toLocaleString()} units</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                      <MapPin size={14} color="var(--primary)" /> Location:
                    </span>
                    <span>{rfq.deliveryLocation}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                      <Calendar size={14} color="var(--primary)" /> Deadline:
                    </span>
                    <span style={{ fontWeight: 600, color: rfq.isExpired ? 'var(--danger)' : 'var(--text-main)' }}>
                      {new Date(rfq.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <Link
                    to={`/supplier/rfqs/${rfq.id}`}
                    className={`btn btn-block ${rfq.effectiveStatus === 'OPEN' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {rfq.effectiveStatus === 'OPEN' ? 'Submit Quotation' : 'View Details'} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
