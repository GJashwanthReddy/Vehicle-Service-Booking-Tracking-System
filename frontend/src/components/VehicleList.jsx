import React from 'react';
import { Car, Trash2 } from 'lucide-react';
import api from '../api';

export default function VehicleList({ vehicles, onRefresh }) {

  const handleDelete = async (id, num) => {
    if (window.confirm(`Are you sure you want to delete vehicle "${num}" (ID #${id})?`)) {
      try {
        await api.delete(`/vehicles/${id}`);
        if (onRefresh) onRefresh();
      } catch (err) {
        alert('Failed to delete vehicle: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Car size={22} color="var(--accent)" />
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Registered Vehicles</h2>
      </div>

      {vehicles.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No vehicles registered yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Registration Number</th>
                <th>Make & Model</th>
                <th>Fuel Type</th>
                <th>Manufacture Year</th>
                <th>Owner Customer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: '700', color: 'var(--accent)' }}>#{v.id}</td>
                  <td style={{ fontWeight: '700' }}>{v.vehicle_number}</td>
                  <td style={{ fontWeight: '600' }}>{v.brand} {v.model}</td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-main)' }}>
                      {v.fuel_type}
                    </span>
                  </td>
                  <td>{v.manufacture_year || 'N/A'}</td>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                    {v.customer_name || `Customer ID #${v.customer_id}`}
                  </td>
                  <td>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      onClick={() => handleDelete(v.id, v.vehicle_number)}
                      title="Delete Vehicle"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
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
