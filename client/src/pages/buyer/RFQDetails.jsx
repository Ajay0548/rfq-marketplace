import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MessageSquareQuote, 
  MapPin, 
  Calendar, 
  Clock, 
  Package, 
  User 
} from 'lucide-react';

export default function RFQDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchRfqDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/rfqs/${id}`);
      setRfq(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load RFQ details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this RFQ? All associated quotations will also be deleted.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/rfqs/${id}`);
      navigate('/buyer/rfqs');
    } catch (err) {
      alert(err.message || 'Failed to delete RFQ.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading RFQ details..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchRfqDetails} />;
  }

  if (!rfq) return null;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link to="/buyer/rfqs" className="btn btn-sm btn-outline">
          <ArrowLeft size={16} /> Back to My RFQs
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/buyer/rfqs/${id}/edit`} className="btn btn-sm btn-secondary">
            <Edit size={14} /> Edit RFQ
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-sm btn-danger"
          >
            <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <StatusBadge status={rfq.effectiveStatus} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                RFQ #{rfq.id} • Posted {new Date(rfq.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {rfq.productName}
            </h1>
          </div>

          <Link to={`/buyer/rfqs/${id}/quotations`} className="btn btn-primary">
            <MessageSquareQuote size={16} /> View Quotes ({rfq.quotationCount})
          </Link>
        </div>

        <div className="card-body">
          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', padding: '1.25rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Quantity Required
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Package size={18} color="var(--primary)" /> {rfq.quantity.toLocaleString()} units
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Delivery Location
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={18} color="var(--primary)" /> {rfq.deliveryLocation}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Bidding Deadline
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: rfq.isExpired ? 'var(--danger)' : 'var(--text-main)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={18} color={rfq.isExpired ? 'var(--danger)' : 'var(--primary)'} />
                {new Date(rfq.deadline).toLocaleDateString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Buyer Name
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={18} color="var(--primary)" /> {rfq.buyer?.name}
              </div>
            </div>
          </div>

          {/* Detailed Specifications */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Requirement Description & Specifications
            </h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--secondary)', backgroundColor: '#ffffff', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              {rfq.description}
            </div>
          </div>

          {/* Quick link to quotations banner */}
          <div style={{ marginTop: '2rem', padding: '1.25rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-main)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                Received {rfq.quotationCount} Supplier {rfq.quotationCount === 1 ? 'Quotation' : 'Quotations'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Review quoted prices, estimated delivery timelines, and vendor terms.
              </div>
            </div>
            <Link to={`/buyer/rfqs/${id}/quotations`} className="btn btn-sm btn-primary">
              View All Proposals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
