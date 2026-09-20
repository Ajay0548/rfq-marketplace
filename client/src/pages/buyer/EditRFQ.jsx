import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { Save, ArrowLeft } from 'lucide-react';

export default function EditRFQ() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    quantity: '',
    deliveryLocation: '',
    deadline: '',
    status: 'OPEN',
  });

  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRfq = async () => {
      setLoading(true);
      setServerError('');
      try {
        const res = await api.get(`/rfqs/${id}`);
        const rfq = res.data;
        setFormData({
          productName: rfq.productName,
          description: rfq.description,
          quantity: rfq.quantity,
          deliveryLocation: rfq.deliveryLocation,
          deadline: rfq.deadline ? new Date(rfq.deadline).toISOString().split('T')[0] : '',
          status: rfq.status,
        });
      } catch (err) {
        setServerError(err.message || 'Failed to load RFQ details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRfq();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.productName.trim()) {
      errors.productName = 'Product / Service Name is required.';
    }

    if (!formData.description.trim()) {
      errors.description = 'Requirement Description is required.';
    }

    const qty = Number(formData.quantity);
    if (!formData.quantity || isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
      errors.quantity = 'Quantity must be a positive whole number.';
    }

    if (!formData.deliveryLocation.trim()) {
      errors.deliveryLocation = 'Delivery Location is required.';
    }

    if (!formData.deadline) {
      errors.deadline = 'RFQ Deadline is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        productName: formData.productName.trim(),
        description: formData.description.trim(),
        quantity: parseInt(formData.quantity, 10),
        deliveryLocation: formData.deliveryLocation.trim(),
        deadline: new Date(formData.deadline).toISOString(),
        status: formData.status,
      };

      await api.put(`/rfqs/${id}`, payload);
      navigate(`/buyer/rfqs/${id}`);
    } catch (err) {
      setServerError(err.message || 'Failed to update RFQ.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading RFQ for editing..." />;
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/buyer/rfqs/${id}`} className="btn btn-sm btn-outline">
          <ArrowLeft size={16} /> Back to RFQ
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '1.25rem' }}>
              Edit Request for Quotation
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Update requirement specifications or modify the status
            </p>
          </div>
        </div>

        <div className="card-body">
          {serverError && <ErrorAlert message={serverError} />}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="productName">
                Product / Service Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="productName"
                name="productName"
                type="text"
                className="form-input"
                value={formData.productName}
                onChange={handleChange}
              />
              {formErrors.productName && <p className="form-error">{formErrors.productName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Requirement Description <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
              />
              {formErrors.description && <p className="form-error">{formErrors.description}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="quantity">
                  Quantity Required <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  step="1"
                  className="form-input"
                  value={formData.quantity}
                  onChange={handleChange}
                />
                {formErrors.quantity && <p className="form-error">{formErrors.quantity}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="deadline">
                  RFQ Deadline <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  className="form-input"
                  value={formData.deadline}
                  onChange={handleChange}
                />
                {formErrors.deadline && <p className="form-error">{formErrors.deadline}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="deliveryLocation">
                  Delivery Location <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="deliveryLocation"
                  name="deliveryLocation"
                  type="text"
                  className="form-input"
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                />
                {formErrors.deliveryLocation && (
                  <p className="form-error">{formErrors.deliveryLocation}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="status">
                  RFQ Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="OPEN">OPEN (Accepting quotes)</option>
                  <option value="CLOSED">CLOSED (Bidding concluded)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem', justifyContent: 'flex-end' }}>
              <Link to={`/buyer/rfqs/${id}`} className="btn btn-outline">
                Cancel
              </Link>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                <Save size={16} />
                {submitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
