import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import { 
  ArrowLeft, 
  Clock, 
  MessageSquare, 
  Calendar, 
  Truck, 
  CheckCircle,
  Building,
  DollarSign
} from 'lucide-react';

export default function ViewQuotations() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQuotations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/rfqs/${id}/quotations`);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch quotations for this RFQ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading submitted quotations..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchQuotations} />;
  }

  const { rfq, quotations } = data || { quotations: [] };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/buyer/rfqs/${id}`} className="btn btn-sm btn-outline">
          <ArrowLeft size={16} /> Back to RFQ Details
        </Link>
      </div>

      {/* RFQ Header Context */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
              <StatusBadge status={rfq?.effectiveStatus} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                RFQ #{rfq?.id}
              </span>
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Quotations for: {rfq?.productName}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Required: <strong>{rfq?.quantity.toLocaleString()} units</strong> • Location: <strong>{rfq?.deliveryLocation}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Quotations Received
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
              {quotations.length}
            </div>
          </div>
        </div>
      </div>

      {/* Quotations List */}
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
          Submitted Supplier Proposals
        </h2>

        {quotations.length === 0 ? (
          <EmptyState
            title="No Quotations Received Yet"
            description="Suppliers have not submitted quotes for this RFQ yet. Quotes will appear here as soon as suppliers submit them."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {quotations.map((quote, index) => (
              <div key={quote.id} className="card" style={{ borderLeft: index === 0 ? '4px solid var(--primary)' : '1px solid var(--border-color)' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building size={18} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {quote.supplierName}
                        </h3>
                        {index === 0 && (
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                            Lowest Price
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Submitted on {new Date(quote.createdAt).toLocaleDateString()} at {new Date(quote.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Quoted Total Price
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                        ₹{Number(quote.quotedPrice).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Quote metadata chips */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                      <Truck size={18} color="var(--primary)" />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Delivery</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{quote.estimatedDelivery}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                      <DollarSign size={18} color="var(--primary)" />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unit Price Approx.</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                          ₹{(quote.quotedPrice / (rfq?.quantity || 1)).toFixed(2)} / unit
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Notes / Message */}
                  {quote.message && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MessageSquare size={14} /> Message / Notes from Supplier:
                      </div>
                      <div style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--secondary)', lineHeight: 1.5 }}>
                        {quote.message}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
