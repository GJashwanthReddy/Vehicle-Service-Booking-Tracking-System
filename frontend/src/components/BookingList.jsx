import React, { useState } from 'react';
import { CalendarCheck, RefreshCw, Filter, Search } from 'lucide-react';
import { updateBookingStatus } from '../api';

export default function BookingList({ bookings, onRefresh }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, newStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const nameMatch = (b.customer_name || '').toLowerCase().includes(q);
    const phoneMatch = (b.customer_phone || '').toLowerCase().includes(q);
    const vehicleMatch = (b.vehicle_number || '').toLowerCase().includes(q);
    const serviceMatch = (b.service_type || '').toLowerCase().includes(q);
    const idMatch = String(b.id || '').includes(q);

    return matchesStatus && (nameMatch || phoneMatch || vehicleMatch || serviceMatch || idMatch);
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarCheck size={22} color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Service Bookings & Live Status</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Real-time Instant Search Box */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '32px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '0.85rem' }}
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-control"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses ({bookings.length})</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Service</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button className="btn btn-secondary" onClick={onRefresh} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem', marginBottom: '6px' }}>No bookings found for the selected filter.</p>
          <p style={{ fontSize: '0.85rem' }}>Create a booking using the "Book Service" button above.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Vehicle Number</th>
                <th>Service Type</th>
                <th>Booking Date & Slot</th>
                <th>Current Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>#{b.id}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{b.customer_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.customer_phone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: 'var(--accent)' }}>{b.vehicle_number}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.vehicle_details || `${b.brand || ''} ${b.model || ''}`}</div>
                  </td>
                  <td style={{ fontWeight: '600' }}>{b.service_type}</td>
                  <td>
                    <div>{new Date(b.booking_date).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.preferred_slot}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${b.status ? b.status.toLowerCase() : 'pending'}`}>
                      {b.status === 'IN_PROGRESS' ? 'IN SERVICE' : b.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '4px 8px', fontSize: '0.82rem', width: '130px' }}
                      value={b.status}
                      disabled={updatingId === b.id}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Service</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
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
