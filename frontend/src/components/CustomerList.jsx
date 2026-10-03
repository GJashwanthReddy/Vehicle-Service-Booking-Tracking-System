import React from 'react';
import { Users, Trash2 } from 'lucide-react';
import api from '../api';

export default function CustomerList({ customers, onRefresh }) {

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}" (ID #${id})? Linked vehicles and bookings will also be removed.`)) {
      try {
        await api.delete(`/customers/${id}`);
        if (onRefresh) onRefresh();
      } catch (err) {
        alert('Failed to delete customer: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Users size={22} color="var(--primary)" />
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Customer Directory</h2>
      </div>

      {customers.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No registered customers found in database.</p>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>#{c.id}</td>
                  <td style={{ fontWeight: '600' }}>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.address || 'N/A'}</td>
                  <td>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      onClick={() => handleDelete(c.id, c.name)}
                      title="Delete Customer"
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
