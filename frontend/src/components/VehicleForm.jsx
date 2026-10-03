import React, { useState, useEffect } from 'react';
import { Car, CheckCircle, AlertCircle, PlusCircle, UserPlus } from 'lucide-react';
import { createVehicle } from '../api';

const VEHICLE_NUM_REGEX = /^[A-Z0-9\s\-]{4,15}$/i;

export default function VehicleForm({ customers, onVehicleAdded, onNavigateToCustomer }) {
  const [formData, setFormData] = useState({
    customer_id: customers && customers.length > 0 ? customers[0].id : '',
    vehicle_number: '',
    brand: '',
    model: '',
    fuel_type: 'PETROL',
    manufacture_year: new Date().getFullYear()
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [serverError, setServerError] = useState(null);

  // Auto-select first customer if available and not selected
  useEffect(() => {
    if (customers && customers.length > 0 && !formData.customer_id) {
      setFormData(prev => ({ ...prev, customer_id: customers[0].id }));
    }
  }, [customers]);

  const validateVehicleNumber = (val) => {
    if (!val || !val.trim()) return 'Vehicle registration number is required.';
    if (!VEHICLE_NUM_REGEX.test(val.trim())) return 'Invalid vehicle registration format (e.g. AP 09 AB 1234).';
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setServerError(null);
    setMessage(null);

    if (name === 'vehicle_number') {
      setFieldErrors(prev => ({ ...prev, vehicle_number: validateVehicleNumber(value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setServerError(null);

    if (!formData.customer_id) {
      setServerError('Please select a registered customer to own this vehicle.');
      return;
    }

    const vehErr = validateVehicleNumber(formData.vehicle_number);
    if (vehErr) {
      setFieldErrors({ vehicle_number: vehErr });
      return;
    }

    if (!formData.brand.trim()) {
      setServerError('Vehicle make/brand is required.');
      return;
    }

    if (!formData.model.trim()) {
      setServerError('Vehicle model is required.');
      return;
    }

    setLoading(true);

    try {
      const res = await createVehicle({
        customer_id: formData.customer_id,
        vehicle_number: formData.vehicle_number.trim().toUpperCase(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        fuel_type: formData.fuel_type,
        manufacture_year: Number(formData.manufacture_year) || new Date().getFullYear()
      });

      if (res.success) {
        setMessage(`Vehicle "${res.data.vehicle_number}" added successfully!`);
        setFormData({
          customer_id: customers && customers.length > 0 ? customers[0].id : '',
          vehicle_number: '',
          brand: '',
          model: '',
          fuel_type: 'PETROL',
          manufacture_year: new Date().getFullYear()
        });
        setFieldErrors({});
        if (onVehicleAdded) onVehicleAdded();
      } else {
        setServerError(res.message || 'Failed to add vehicle.');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error adding vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-title-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Car size={20} />
          </div>
          <h2 className="card-title">Add New Vehicle</h2>
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

      {!customers || customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 16px', background: 'var(--bg-subtle)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontWeight: '600', marginBottom: '10px', color: 'var(--text-main)' }}>
            No registered customers found. You must register a customer first before adding a vehicle!
          </p>
          {onNavigateToCustomer && (
            <button className="btn btn-primary" onClick={onNavigateToCustomer}>
              <UserPlus size={16} />
              Register Customer Now
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Owner Customer *</label>
            <select
              name="customer_id"
              className="form-control"
              value={formData.customer_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose Registered Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - {c.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Vehicle Registration Number *</label>
              <input
                type="text"
                name="vehicle_number"
                className={`form-control ${fieldErrors.vehicle_number ? 'is-invalid' : ''}`}
                placeholder="e.g. AP 09 AB 1234 or TS09EF9012"
                value={formData.vehicle_number}
                onChange={handleChange}
                required
              />
              {fieldErrors.vehicle_number && <span className="invalid-feedback">{fieldErrors.vehicle_number}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Make / Brand *</label>
              <input
                type="text"
                name="brand"
                className="form-control"
                placeholder="e.g. Hyundai, Toyota, Honda"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Model *</label>
              <input
                type="text"
                name="model"
                className="form-control"
                placeholder="e.g. i20, Fortuner, City"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select
                name="fuel_type"
                className="form-control"
                value={formData.fuel_type}
                onChange={handleChange}
              >
                <option value="PETROL">PETROL</option>
                <option value="DIESEL">DIESEL</option>
                <option value="EV">ELECTRIC (EV)</option>
                <option value="HYBRID">HYBRID</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Manufacture Year</label>
              <input
                type="number"
                name="manufacture_year"
                className="form-control"
                value={formData.manufacture_year}
                onChange={handleChange}
                min="1990"
                max="2027"
              />
            </div>
          </div>

          {/* Clean Right-Aligned Action Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => {
                setFormData({
                  customer_id: customers && customers.length > 0 ? customers[0].id : '',
                  vehicle_number: '',
                  brand: '',
                  model: '',
                  fuel_type: 'PETROL',
                  manufacture_year: new Date().getFullYear()
                });
                setFieldErrors({});
              }}
            >
              Clear
            </button>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              <PlusCircle size={16} />
              {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
