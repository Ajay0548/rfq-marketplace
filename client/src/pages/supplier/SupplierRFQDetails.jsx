import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Package, 
  User, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  DollarSign,
  MessageSquare
} from 'lucide-react';

export default function SupplierRFQDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState(null);
  const [existingQuote, setExistingQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quotation form state
  const [quoteForm, setQuoteForm] = useState({
    quotedPrice: '',
    estimatedDelivery: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRfqData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rfqRes, myQuotesRes] = await Promise.all([
        api.get(`/rfqs/${id}`),
        api.get('/supplier/quotations'),
      ]);

      setRfq(rfqRes.data);

      // Check if this supplier already submitted a quote for this RFQ
      const previous = myQuotesRes.data.find((q) => q.rfqId === parseInt(id, 10));
      if (previous) {
        setExistingQuote(previous);
      }
    } catch (err) {
      setError(err.message || 'Failed to load RFQ details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqData();
  }, [id]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateQuote = () => {
    const errors = {};
    const price = Number(quoteForm.quotedPrice);

    if (!quoteForm.quotedPrice || isNaN(price) || price <= 0) {
      errors.quotedPrice = 'Quoted price must be greater than 0.';
    }

    if (!quoteForm.estimatedDelivery.trim()) {
      errors.estimatedDelivery = 'Estimated delivery time is required (e.g., "7 days", "2 weeks").';
    }

    if (quoteForm.message && quoteForm.message.length > 1000) {
      errors.message = 'Message must be less than 1000 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!validateQuote()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        quotedPrice: Number(quoteForm.quotedPrice),
        estimatedDelivery: quoteForm.estimatedDelivery.trim(),
        message: quoteForm.message.trim() || null,
      };

      const res = await api.post(`/rfqs/${id}/quotations`, payload);
      setSubmitSuccess('Your quotation was successfully submitted to the buyer!');
      setExistingQuote({
        id: res.data.id,
        quotedPrice: payload.quotedPrice,
        estimatedDelivery: payload.estimatedDelivery,
        message: payload.message,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit quotation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading RFQ specifications..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchRfqData} />;
  }

  if (!rfq) return null;

  const isClosedOrExpired = rfq.effectiveStatus === 'CLOSED' || rfq.isExpired;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/supplier/rfqs" className="btn btn-sm btn-outline">
          <ArrowLeft size={16} /> Back to Browse RFQs
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <StatusBadge status={rfq.effectiveStatus} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                RFQ #{rfq.id} • Posted on {new Date(rfq.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {rfq.productName}
            </h1>
          </div>
        </div>

        <div className="card-body">
          {/* Metadata Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', padding: '1.25rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Quantity Needed
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Package size={18} color="var(--primary)" /> {rfq.quantity.toLocaleString()} units
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Delivery Destination
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={18} color="var(--primary)" /> {rfq.deliveryLocation}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Submission Deadline
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: isClosedOrExpired ? 'var(--danger)' : 'var(--text-main)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={18} color={isClosedOrExpired ? 'var(--danger)' : 'var(--primary)'} />
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

          {/* Description */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Full Requirement Description
            </h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--secondary)', backgroundColor: '#ffffff', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              {rfq.description}
            </div>
          </div>
        </div>
      </div>

      {/* Quotation Submission Section */}
      {isClosedOrExpired ? (
        /* Requirement: If expired/closed, show notice and do NOT display quotation form */
        <div className="alert alert-warning" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: 'var(--radius-md)' }}>
          <AlertCircle size={28} style={{ flexShrink: 0, color: '#b45309' }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e', marginBottom: '0.25rem' }}>
              Quotations are closed for this RFQ.
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#b45309', margin: 0 }}>
              The deadline for this request has passed or the buyer has closed the bidding window. No new proposals are being accepted.
            </p>
          </div>
        </div>
      ) : existingQuote ? (
        /* Supplier has already submitted a quote - prevent duplicate submission and show their quote */
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-text)' }}>
              <CheckCircle2 size={20} color="var(--success)" />
              <h2 className="card-title" style={{ color: 'var(--success-text)' }}>
                You have already submitted a quotation for this RFQ
              </h2>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Your Quoted Price</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{Number(existingQuote.quotedPrice).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Estimated Delivery</span>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                  {existingQuote.estimatedDelivery}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Submitted On</span>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {new Date(existingQuote.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {existingQuote.message && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Your Submitted Message:</span>
                <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--secondary)' }}>
                  {existingQuote.message}
                </p>
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/supplier/quotations" className="btn btn-sm btn-outline">
                View All My Quotations
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Quotation Form */
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Submit Supplier Quotation</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Offer your commercial price and delivery schedule for this procurement requirement
              </p>
            </div>
          </div>

          <div className="card-body">
            {submitSuccess && (
              <div className="alert alert-success">
                <CheckCircle2 size={18} />
                <span>{submitSuccess}</span>
              </div>
            )}

            {submitError && <ErrorAlert message={submitError} />}

            <form onSubmit={handleQuoteSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="quotedPrice">
                    Total Quoted Price (₹ INR) <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="quotedPrice"
                      name="quotedPrice"
                      type="number"
                      min="1"
                      step="any"
                      className="form-input"
                      placeholder="e.g. 45000"
                      value={quoteForm.quotedPrice}
                      onChange={handleFormChange}
                    />
                  </div>
                  {formErrors.quotedPrice && (
                    <p className="form-error">{formErrors.quotedPrice}</p>
                  )}
                  {quoteForm.quotedPrice && Number(quoteForm.quotedPrice) > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      ≈ ₹{(Number(quoteForm.quotedPrice) / rfq.quantity).toFixed(2)} / unit ({rfq.quantity} units)
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="estimatedDelivery">
                    Estimated Delivery Time <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="estimatedDelivery"
                    name="estimatedDelivery"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 7 days, 2 weeks, Immediate"
                    value={quoteForm.estimatedDelivery}
                    onChange={handleFormChange}
                  />
                  {formErrors.estimatedDelivery && (
                    <p className="form-error">{formErrors.estimatedDelivery}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">
                  Message / Notes / Commercial Terms (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="form-textarea"
                  placeholder="Provide warranty information, payment terms, packaging details, or freight notes..."
                  value={quoteForm.message}
                  onChange={handleFormChange}
                />
                {formErrors.message && <p className="form-error">{formErrors.message}</p>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  <Send size={16} />
                  {submitting ? 'Submitting Quotation...' : 'Submit Quotation to Buyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
