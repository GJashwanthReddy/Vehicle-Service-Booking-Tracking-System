import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle, AlertCircle, CalendarCheck } from 'lucide-react';
import { createBooking } from '../api';

export default function BookingForm({ customers, vehicles, onBookingAdded }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    service_type: 'Full Periodical Service',
    booking_date: new Date().toISOString().split('T')[0],
    preferred_slot: 'Morning (9 AM - 12 PM)',
    notes: ''
  });

  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (formData.customer_id) {
      const filtered = vehicles.filter(v => v.customer_id == formData.customer_id);
      setAvailableVehicles(filtered);
      if (filtered.length > 0) {
        setFormData(prev => ({ ...prev, vehicle_id: filtered[0].id }));
      } else {
        setFormData(prev => ({ ...prev, vehicle_id: '' }));
      }
    } else {
      setAvailableVehicles([]);
      setFormData(prev => ({ ...prev, vehicle_id: '' }));
    }
  }, [formData.customer_id, vehicles]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setServerError(null);

    if (!formData.customer_id) {
      setServerError('Please select a customer.');
      return;
    }

    if (!formData.vehicle_id) {
      setServerError('Please select a registered vehicle for the service.');
      return;
    }

    if (!formData.booking_date) {
      setServerError('Please select a valid booking date.');
      return;
    }

    setLoading(true);

    try {
      const res = await createBooking(formData);
      if (res.success) {
        setMessage(`Service Appointment #${res.data.id} booked successfully!`);
        setFormData({
          customer_id: '',
          vehicle_id: '',
          service_type: 'Full Periodical Service',
          booking_date: new Date().toISOString().split('T')[0],
          preferred_slot: 'Morning (9 AM - 12 PM)',
          notes: ''
        });
        if (onBookingAdded) onBookingAdded();
      } else {
        setServerError(res.message || 'Failed to create booking.');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-title-icon">
            <Wrench size={20} />
          </div>
          <h2 className="card-title">Book a Vehicle Service</h2>
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

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Select Customer *</label>
            <select
              name="customer_id"
              className="form-control"
              value={formData.customer_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Vehicle *</label>
            <select
              name="vehicle_id"
              className="form-control"
              value={formData.vehicle_id}
              onChange={handleChange}
              disabled={!formData.customer_id || availableVehicles.length === 0}
              required
            >
              {!formData.customer_id && <option value="">-- Choose Customer First --</option>}
              {formData.customer_id && availableVehicles.length === 0 && (
                <option value="">-- No Vehicles Registered. Add a Vehicle First --</option>
              )}
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_number} ({v.brand} {v.model})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Service Package *</label>
            <select
              name="service_type"
              className="form-control"
              value={formData.service_type}
              onChange={handleChange}
            >
              <option value="Full Periodical Service">Full Periodical Service</option>
              <option value="Oil Change & Filter">Oil Change & Filter</option>
              <option value="Brake Inspection & Washing">Brake Inspection & Washing</option>
              <option value="Engine Tuning & Diagnostics">Engine Tuning & Diagnostics</option>
              <option value="AC Servicing & Refrigerant">AC Servicing & Refrigerant</option>
              <option value="Wheel Alignment & Balancing">Wheel Alignment & Balancing</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Booking Date *</label>
            <input
              type="date"
              name="booking_date"
              className="form-control"
              value={formData.booking_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Time Slot *</label>
            <select
              name="preferred_slot"
              className="form-control"
              value={formData.preferred_slot}
              onChange={handleChange}
            >
              <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
              <option value="Afternoon (2 PM - 5 PM)">Afternoon (2 PM - 5 PM)</option>
              <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Problem Description / Notes</label>
          <textarea
            name="notes"
            className="form-control"
            rows="2"
            placeholder="e.g. Unusual noise in front wheel, brake check requested"
            value={formData.notes}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Clean Right-Aligned Action Buttons */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => {
              setFormData({
                customer_id: '',
                vehicle_id: '',
                service_type: 'Full Periodical Service',
                booking_date: new Date().toISOString().split('T')[0],
                preferred_slot: 'Morning (9 AM - 12 PM)',
                notes: ''
              });
            }}
          >
            Clear
          </button>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            <CalendarCheck size={16} />
            {loading ? 'Submitting...' : 'Confirm Service Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
