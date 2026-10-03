import React, { useState } from 'react';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { createCustomer } from '../api';

const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hasMaxFourSameDigits = (phoneStr) => {
  const counts = {};
  for (const char of phoneStr) {
    counts[char] = (counts[char] || 0) + 1;
    if (counts[char] > 4) {
      return false;
    }
  }
  return true;
};

export default function CustomerForm({ onCustomerAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [serverError, setServerError] = useState(null);

  const validatePhone = (value) => {
    if (!value) return 'Phone number is required.';
    if (/[a-zA-Z]/.test(value)) return 'Letters are not allowed in phone number.';
    if (/\s/.test(value)) return 'Spaces are not allowed in phone number.';
    if (/[^0-9]/.test(value)) return 'Phone number must contain digits only.';
    if (value.length !== 10) return `Phone number must be exactly 10 digits (currently ${value.length}).`;
    if (!PHONE_REGEX.test(value)) return 'Must be a 10-digit mobile number starting with 6, 7, 8, or 9.';
    if (!hasMaxFourSameDigits(value)) return 'Phone number cannot contain the same digit more than 4 times.';
    return null;
  };

  const validateEmail = (value) => {
    if (!value) return 'Email address is required.';
    if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email format (e.g. name@example.com).';
    return null;
  };

  const validateName = (value) => {
    if (!value || !value.trim()) return 'Full Name is required.';
    if (/\d/.test(value)) return 'Full Name should not contain numbers.';
    if (value.trim().length < 2) return 'Full Name must be at least 2 characters.';
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    let err = null;
    if (name === 'phone') err = validatePhone(value);
    if (name === 'email') err = validateEmail(value);
    if (name === 'name') err = validateName(value);

    setFieldErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setServerError(null);

    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    const phoneErr = validatePhone(formData.phone);

    if (nameErr || emailErr || phoneErr) {
      setFieldErrors({
        name: nameErr,
        email: emailErr,
        phone: phoneErr
      });
      return;
    }

    setLoading(true);

    try {
      const res = await createCustomer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim()
      });

      if (res.success) {
        setMessage(`Customer "${res.data.name}" registered successfully!`);
        setFormData({ name: '', email: '', phone: '', address: '' });
        setFieldErrors({});
        if (onCustomerAdded) onCustomerAdded();
      } else {
        setServerError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to submit request to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-title-icon">
            <UserPlus size={20} />
          </div>
          <h2 className="card-title">Register New Customer</h2>
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {serverError && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            name="name"
            className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
            placeholder="e.g. Rajesh Kumar"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {fieldErrors.name && <span className="invalid-feedback">{fieldErrors.name}</span>}
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
              placeholder="e.g. rajesh@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && <span className="invalid-feedback">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Phone Number (10 Digits) *</label>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                color: formData.phone.length === 10 && !fieldErrors.phone ? 'var(--success)' : 'var(--text-muted)' 
              }}>
                {formData.phone.length} / 10 digits
              </span>
            </div>
            <input
              type="text"
              name="phone"
              maxLength="10"
              className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`}
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            {fieldErrors.phone ? (
              <span className="invalid-feedback">{fieldErrors.phone}</span>
            ) : (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>Starts with 6-9</span>
                <span>•</span>
                <span>Max 4 repeated digits</span>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            type="text"
            name="address"
            className="form-control"
            placeholder="e.g. Jubilee Hills, Hyderabad"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        {/* Clean Right-Aligned Action Buttons */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => {
              setFormData({ name: '', email: '', phone: '', address: '' });
              setFieldErrors({});
            }}
          >
            Clear Form
          </button>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            <UserPlus size={16} />
            {loading ? 'Registering...' : 'Register Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
