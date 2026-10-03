import React, { useState, useEffect } from 'react';
import { getTechnicians, createTechnician, updateTechnicianStatus } from '../api';
import { UserCheck, Plus, RefreshCw, AlertCircle, Phone, Award } from 'lucide-react';

export default function TechnicianManager() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('Engine & Transmission');
  const [status, setStatus] = useState('Available');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadTechnicians = async () => {
    setLoading(true);
    try {
      const res = await getTechnicians();
      setTechnicians(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const handleAddTechnician = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Technician name is required.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setErrorMsg('Valid 10-digit mobile number starting with 6-9 is required.');
      return;
    }

    try {
      await createTechnician({ name, phone, specialization, status });
      setSuccessMsg('Technician added successfully!');
      setName('');
      setPhone('');
      setShowAddForm(false);
      loadTechnicians();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add technician');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTechnicianStatus(id, newStatus);
      loadTechnicians();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="card-box" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={22} color="var(--primary)" />
            Technician Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage service workshop mechanics and allocation availability</p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Add Technician'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
          {successMsg}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddTechnician} style={{ background: 'var(--bg-subtle)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Register New Technician</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Phone Number (10 Digits)</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="form-label">Specialization</label>
              <select className="form-control" value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                <option value="Engine & Transmission Specialist">Engine & Transmission Specialist</option>
                <option value="Brake & Suspension Specialist">Brake & Suspension Specialist</option>
                <option value="Auto Electrical & AC Specialist">Auto Electrical & AC Specialist</option>
                <option value="General Maintenance & Detailing">General Maintenance & Detailing</option>
              </select>
            </div>
            <div>
              <label className="form-label">Initial Status</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save Technician</button>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          <RefreshCw className="spin" size={24} />
          <p style={{ marginTop: '8px' }}>Loading Technicians...</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Technician Name</th>
                <th>Contact Phone</th>
                <th>Specialization</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {technicians.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No technicians registered yet.</td>
                </tr>
              ) : (
                technicians.map((t) => (
                  <tr key={t.id}>
                    <td><strong>#{t.id}</strong></td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{t.name}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} color="var(--text-muted)" />
                        {t.phone}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        <Award size={14} color="var(--primary)" />
                        {t.specialization}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.status === 'Available' ? 'badge-completed' : t.status === 'Busy' ? 'badge-in-progress' : 'badge-pending'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      >
                        <option value="Available">Set Available</option>
                        <option value="Busy">Set Busy</option>
                        <option value="On Leave">Set On Leave</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
