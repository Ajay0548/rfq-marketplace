import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import { 
  PlusCircle, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  MessageSquareQuote, 
  MapPin, 
  Calendar,
  AlertTriangle 
} from 'lucide-react';

export default function MyRFQs() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchRfqs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/buyer/rfqs');
      setRfqs(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch RFQs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/rfqs/${id}`);
      setRfqs(rfqs.filter((r) => r.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete RFQ.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter & search locally for immediate responsive feedback
  const filteredRfqs = rfqs.filter((rfq) => {
    const matchesSearch =
      rfq.productName.toLowerCase().includes(search.toLowerCase()) ||
      rfq.deliveryLocation.toLowerCase().includes(search.toLowerCase()) ||
      rfq.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || rfq.effectiveStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My RFQs</h1>
          <p className="page-subtitle">
            Manage your procurement requirements, edit terms, or inspect submitted supplier quotations
          </p>
        </div>
        <Link to="/buyer/rfqs/create" className="btn btn-primary">
          <PlusCircle size={18} /> Create New RFQ
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by product, specification, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open Only</option>
            <option value="CLOSED">Closed / Expired</option>
          </select>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchRfqs} />}

      {loading ? (
        <LoadingSpinner message="Loading your RFQs..." />
      ) : filteredRfqs.length === 0 ? (
        <EmptyState
          title={search || statusFilter !== 'ALL' ? 'No matching RFQs' : 'No RFQs Created Yet'}
          description={
            search || statusFilter !== 'ALL'
              ? 'Try adjusting your search criteria or filter options.'
              : 'You have not created any Requests for Quotation yet. Post your first RFQ to receive supplier bids.'
          }
          actionLabel={!search && statusFilter === 'ALL' ? 'Create First RFQ' : 'Clear Filters'}
          actionLink={!search && statusFilter === 'ALL' ? '/buyer/rfqs/create' : undefined}
          onAction={
            search || statusFilter !== 'ALL'
              ? () => {
                  setSearch('');
                  setStatusFilter('ALL');
                }
              : undefined
          }
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product / Service</th>
                <th>Quantity</th>
                <th>Delivery Location</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Quotations</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRfqs.map((rfq) => (
                <tr key={rfq.id}>
                  <td>
                    <Link
                      to={`/buyer/rfqs/${rfq.id}`}
                      style={{ fontWeight: 600, color: 'var(--text-main)' }}
                    >
                      {rfq.productName}
                    </Link>
                  </td>
                  <td>
                    <strong>{rfq.quantity.toLocaleString()}</strong> units
                  </td>
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
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {new Date(rfq.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {deleteConfirmId === rfq.id ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
                          Confirm?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(rfq.id)}
                          disabled={deletingId === rfq.id}
                          className="btn btn-sm btn-danger"
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          {deletingId === rfq.id ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="btn btn-sm btn-outline"
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <Link
                          to={`/buyer/rfqs/${rfq.id}`}
                          className="btn btn-sm btn-outline"
                          title="View Details"
                        >
                          <Eye size={14} /> View
                        </Link>
                        <Link
                          to={`/buyer/rfqs/${rfq.id}/edit`}
                          className="btn btn-sm btn-secondary"
                          title="Edit RFQ"
                        >
                          <Edit size={14} /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(rfq.id)}
                          className="btn btn-sm btn-outline"
                          style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
                          title="Delete RFQ"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
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
