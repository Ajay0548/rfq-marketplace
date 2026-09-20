import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import ErrorAlert from '../../components/ErrorAlert';
import { PlusCircle, ArrowLeft } from 'lucide-react';

export default function CreateRFQ() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    quantity: '',
    deliveryLocation: '',
    deadline: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Minimum deadline is tomorrow
  const minDeadlineDate = new Date();
  minDeadlineDate.setDate(minDeadlineDate.getDate() + 1);
  const minDeadlineStr = minDeadlineDate.toISOString().split('T')[0];

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
      errors.quantity = 'Quantity must be a positive whole number (e.g. 100).';
    }

    if (!formData.deliveryLocation.trim()) {
      errors.deliveryLocation = 'Delivery Location is required.';
    }

    if (!formData.deadline) {
      errors.deadline = 'RFQ Deadline is required.';
    } else {
      const selectedDate = new Date(formData.deadline);
      if (isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
        errors.deadline = 'Deadline must be a valid date in the future.';
      }
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
      };

      const res = await api.post('/rfqs', payload);
      navigate(`/buyer/rfqs/${res.data.id}`);
    } catch (err) {
      setServerError(err.message || 'Failed to create RFQ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/buyer/rfqs" className="btn btn-sm btn-outline">
          <ArrowLeft size={16} /> Back to My RFQs
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '1.25rem' }}>
              Create Request for Quotation (RFQ)
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Specify your procurement requirements to invite quotes from certified suppliers
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
                placeholder="e.g. Industrial Safety Gloves, Commercial Solar Inverter 50kW"
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
                placeholder="Detail the technical specifications, certifications, quality standards, or packaging requirements..."
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
                  placeholder="e.g. 500"
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
                  min={minDeadlineStr}
                  className="form-input"
                  value={formData.deadline}
                  onChange={handleChange}
                />
                {formErrors.deadline && <p className="form-error">{formErrors.deadline}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="deliveryLocation">
                Delivery Location <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="deliveryLocation"
                name="deliveryLocation"
                type="text"
                className="form-input"
                placeholder="e.g. Hyderabad, Telangana or Warehouse 4, Pune, Maharashtra"
                value={formData.deliveryLocation}
                onChange={handleChange}
              />
              {formErrors.deliveryLocation && (
                <p className="form-error">{formErrors.deliveryLocation}</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem', justifyContent: 'flex-end' }}>
              <Link to="/buyer/rfqs" className="btn btn-outline">
                Cancel
              </Link>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                <PlusCircle size={16} />
                {submitting ? 'Publishing RFQ...' : 'Publish RFQ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
