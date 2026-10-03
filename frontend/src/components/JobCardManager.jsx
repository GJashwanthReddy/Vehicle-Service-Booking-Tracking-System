import React, { useState, useEffect } from 'react';
import { getJobCards, getJobCardById, createJobCard, updateJobCard, getTechnicians, getSpareParts, addPartUsed, generateInvoice } from '../api';
import { FileText, Plus, UserCheck, Wrench, Package, DollarSign, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function JobCardManager({ bookings = [], onRefresh, onRefreshParent }) {
  const refreshAll = onRefresh || onRefreshParent;
  const [jobCards, setJobCards] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');
  const [problemDesc, setProblemDesc] = useState('');
  const [workDesc, setWorkDesc] = useState('');

  const [selectedJobCard, setSelectedJobCard] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partError, setPartError] = useState('');
  const [partSuccess, setPartSuccess] = useState('');

  const loadAllJobData = async () => {
    setLoading(true);
    try {
      const [jRes, tRes, pRes] = await Promise.all([
        getJobCards(),
        getTechnicians(),
        getSpareParts()
      ]);
      setJobCards(jRes.data || []);
      setTechnicians(tRes.data || []);
      setSpareParts(pRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllJobData();
  }, []);

  const handleCreateJobCard = async (e) => {
    e.preventDefault();
    if (!selectedBookingId) {
      alert('Please select a booking');
      return;
    }

    try {
      await createJobCard({
        booking_id: Number(selectedBookingId),
        technician_id: selectedTechId ? Number(selectedTechId) : null,
        problem_description: problemDesc,
        work_description: workDesc
      });
      alert('Job Card created successfully!');
      setShowCreateModal(false);
      setSelectedBookingId('');
      setSelectedTechId('');
      setProblemDesc('');
      setWorkDesc('');
      loadAllJobData();
      if (refreshAll) refreshAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create Job Card');
    }
  };

  const openJobCardDetail = async (id) => {
    try {
      const res = await getJobCardById(id);
      setSelectedJobCard(res.data);
      setShowDetailModal(true);
      setPartError('');
      setPartSuccess('');
    } catch (err) {
      alert('Failed to load Job Card details');
    }
  };

  const handleStatusChange = async (id, newStatus, currentTechId, workDescStr) => {
    try {
      await updateJobCard(id, {
        status: newStatus,
        technician_id: currentTechId,
        work_description: workDescStr
      });
      loadAllJobData();
      if (selectedJobCard && selectedJobCard.id === id) {
        openJobCardDetail(id);
      }
      if (refreshAll) refreshAll();
    } catch (err) {
      alert('Failed to update Job Card status');
    }
  };

  const handleAddPartUsed = async (e) => {
    e.preventDefault();
    setPartError('');
    setPartSuccess('');

    if (!selectedPartId) {
      setPartError('Please select a spare part');
      return;
    }

    try {
      const res = await addPartUsed({
        job_card_id: selectedJobCard.id,
        part_id: Number(selectedPartId),
        quantity_used: Number(partQty)
      });
      setPartSuccess(res.message);
      setSelectedPartId('');
      setPartQty(1);
      openJobCardDetail(selectedJobCard.id);
      loadAllJobData();
    } catch (err) {
      setPartError(err.response?.data?.message || 'Failed to record part usage');
    }
  };

  const handleGenerateInvoice = async (jobCardId) => {
    try {
      const res = await generateInvoice(jobCardId);
      alert(`Invoice generated successfully! Invoice Total: ₹${res.data.total_amount}`);
      loadAllJobData();
      if (refreshAll) refreshAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  // Eligible bookings (excluding CANCELLED and bookings that already have a Job Card)
  const existingBookingIds = new Set(jobCards.map(jc => Number(jc.booking_id)));
  const availableBookings = bookings.filter(b => b.status !== 'CANCELLED' && !existingBookingIds.has(Number(b.id)));

  return (
    <div className="card-box" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} color="var(--primary)" />
            Job Card Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Work order tracking, technician assignment, spare part usage, and billing triggers</p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          New Job Card
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          <RefreshCw className="spin" size={24} />
          <p style={{ marginTop: '8px' }}>Loading Job Cards...</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Job Card ID</th>
                <th>Booking Ref</th>
                <th>Customer & Phone</th>
                <th>Vehicle Details</th>
                <th>Service Type</th>
                <th>Assigned Tech</th>
                <th>Job Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobCards.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No Job Cards created yet.</td>
                </tr>
              ) : (
                jobCards.map((j) => (
                  <tr key={j.id}>
                    <td><strong>JC-#{j.id}</strong></td>
                    <td>#BK-{j.booking_id}</td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{j.customer_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{j.customer_phone}</div>
                    </td>
                    <td>
                      <span className="vehicle-badge">{j.vehicle_number}</span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{j.brand} {j.model}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: '500' }}>{j.service_type}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: j.technician_name === 'Unassigned' ? 'var(--text-muted)' : 'var(--primary)', fontWeight: '600' }}>
                        {j.technician_name}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${j.status === 'Completed' ? 'badge-completed' : j.status === 'In Service' ? 'badge-in-progress' : 'badge-pending'}`}>
                        {j.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => openJobCardDetail(j.id)}
                        >
                          Details & Parts
                        </button>
                        {j.status === 'Completed' ? (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#059669', borderColor: '#059669' }}
                            onClick={() => handleGenerateInvoice(j.id)}
                          >
                            Generate Invoice
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE JOB CARD MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px' }}>Create Work Order Job Card</h3>
            
            <form onSubmit={handleCreateJobCard}>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Select Active Booking</label>
                <select 
                  className="form-control"
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Customer Service Booking --</option>
                  {availableBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      #BK-{b.id} | {b.customer_name} - {b.vehicle_number} ({b.service_type})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Assign Technician (Optional)</label>
                <select 
                  className="form-control"
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                >
                  <option value="">-- Unassigned (Assign Later) --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialization}) - [{t.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Problem / Customer Instructions</label>
                <textarea 
                  className="form-control"
                  rows={2}
                  placeholder="e.g. Periodic 20,000 km maintenance service, check brake pad wear"
                  value={problemDesc}
                  onChange={(e) => setProblemDesc(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Initial Work Instructions</label>
                <textarea 
                  className="form-control"
                  rows={2}
                  placeholder="e.g. Inspect engine oil level, clean air filter, test battery"
                  value={workDesc}
                  onChange={(e) => setWorkDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Job Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOB CARD DETAILS & SPARE PARTS USAGE MODAL */}
      {showDetailModal && selectedJobCard && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Job Card #JC-{selectedJobCard.id}</h3>
                <span className={`badge ${selectedJobCard.status === 'Completed' ? 'badge-completed' : 'badge-in-progress'}`}>{selectedJobCard.status}</span>
              </div>
              <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-subtle)', padding: '16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
              <div><strong>Customer:</strong> {selectedJobCard.customer_name} ({selectedJobCard.customer_phone})</div>
              <div><strong>Vehicle:</strong> {selectedJobCard.vehicle_number} ({selectedJobCard.brand} {selectedJobCard.model})</div>
              <div><strong>Service Type:</strong> {selectedJobCard.service_type}</div>
              <div><strong>Assigned Tech:</strong> {selectedJobCard.technician_name}</div>
            </div>

            {/* STATUS UPDATE ACTIONS */}
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: '700' }}>Update Work Order Status</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                {['Assigned', 'In Service', 'Completed'].map((st) => (
                  <button
                    key={st}
                    className={`btn ${selectedJobCard.status === st ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    onClick={() => handleStatusChange(selectedJobCard.id, st, selectedJobCard.technician_id, selectedJobCard.work_description)}
                  >
                    Set {st}
                  </button>
                ))}
              </div>
            </div>

            {/* RECORD SPARE PART USED */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={16} color="var(--primary)" />
                Record Spare Parts Used (Auto Stock Reduction via DB Trigger)
              </h4>

              {partError && <div style={{ padding: '8px 12px', background: '#FEF2F2', color: '#991B1B', borderRadius: '6px', marginBottom: '10px', fontSize: '0.82rem' }}>{partError}</div>}
              {partSuccess && <div style={{ padding: '8px 12px', background: '#ECFDF5', color: '#065F46', borderRadius: '6px', marginBottom: '10px', fontSize: '0.82rem' }}>{partSuccess}</div>}

              <form onSubmit={handleAddPartUsed} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 2 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Select Part</label>
                  <select 
                    className="form-control"
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                    required
                  >
                    <option value="">-- Choose Spare Part --</option>
                    {spareParts.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.part_name} [{sp.part_number}] - Stock: {sp.quantity_available} (₹{sp.unit_price})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Qty</label>
                  <input 
                    type="number"
                    className="form-control"
                    min="1"
                    value={partQty}
                    onChange={(e) => setPartQty(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
                  Add Part
                </button>
              </form>

              {/* LIST OF PARTS USED */}
              <div style={{ marginTop: '14px' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Parts Installed on this Job:</h5>
                {!selectedJobCard.parts_used || selectedJobCard.parts_used.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No spare parts added yet.</p>
                ) : (
                  <table className="data-table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th>Part Name</th>
                        <th>SKU</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedJobCard.parts_used.map((pu) => (
                        <tr key={pu.id}>
                          <td>{pu.part_name}</td>
                          <td><code>{pu.part_number}</code></td>
                          <td>{pu.quantity_used}</td>
                          <td>₹{pu.unit_price}</td>
                          <td><strong>₹{(pu.quantity_used * pu.unit_price).toFixed(2)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {selectedJobCard.status === 'Completed' && (
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', background: '#059669', borderColor: '#059669' }}
                onClick={() => {
                  handleGenerateInvoice(selectedJobCard.id);
                  setShowDetailModal(false);
                }}
              >
                Generate Final Bill Invoice
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
