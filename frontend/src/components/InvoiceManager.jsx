import React, { useState, useEffect } from 'react';
import { getInvoices, generateInvoice, updatePaymentStatus, getJobCards } from '../api';
import { FileText, DollarSign, CheckCircle, Clock, Printer, PlusCircle, Search, RefreshCw } from 'lucide-react';

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState([]);
  const [completedJobCards, setCompletedJobCards] = useState([]);
  const [selectedJobCardId, setSelectedJobCardId] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const invRes = await getInvoices();
      const invList = Array.isArray(invRes) ? invRes : (invRes?.data || []);
      setInvoices(invList);

      const jcRes = await getJobCards();
      const jcList = Array.isArray(jcRes) ? jcRes : (jcRes?.data || []);

      // Filter job cards that are Completed but don't have an invoice yet
      const existingJcIds = new Set(invList.map(inv => Number(inv.job_card_id)));
      const eligible = jcList.filter(jc => (jc.status === 'Completed' || jc.status === 'COMPLETED') && !existingJcIds.has(Number(jc.id)));
      setCompletedJobCards(eligible);
    } catch (err) {
      console.error('Failed to load invoice data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedJobCardId) return;

    setGenerating(true);
    setMessage(null);
    try {
      const res = await generateInvoice(selectedJobCardId);
      setMessage({ type: 'success', text: res.message || 'Invoice generated successfully!' });
      setSelectedJobCardId('');
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to generate invoice.' });
    } finally {
      setGenerating(false);
    }
  };

  const handlePaymentUpdate = async (invoiceId, currentStatus) => {
    const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      await updatePaymentStatus(invoiceId, newStatus);
      const safeInv = Array.isArray(invoices) ? invoices : [];
      setInvoices(safeInv.map(inv => inv.id === invoiceId ? { ...inv, payment_status: newStatus } : inv));
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, payment_status: newStatus });
      }
      setMessage({ type: 'success', text: `Invoice #${invoiceId} marked as ${newStatus}.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update payment status.' });
    }
  };

  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const filteredInvoices = safeInvoices.filter(inv => {
    const matchesSearch = 
      (inv.id && inv.id.toString().includes(searchTerm)) ||
      (inv.customer_name && inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.vehicle_number && inv.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || inv.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = safeInvoices.reduce((acc, inv) => acc + Number(inv.total_amount || 0), 0);
  const paidRevenue = safeInvoices.filter(i => i.payment_status === 'Paid').reduce((acc, inv) => acc + Number(inv.total_amount || 0), 0);
  const pendingRevenue = safeInvoices.filter(i => i.payment_status === 'Pending').reduce((acc, inv) => acc + Number(inv.total_amount || 0), 0);

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Billing & Invoice Management</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Generate final invoices for completed work orders, compute taxes, and track payment settlement.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} style={{ gap: '6px' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? 'var(--bg-subtle)' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? 'var(--border-color)' : '#fecaca'}`,
          color: message.type === 'success' ? 'var(--primary)' : '#dc2626',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          {message.text}
        </div>
      )}

      {/* REVENUE STATS CARDS */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px', color: 'var(--primary)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Invoiced</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>₹{totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Collected Payments</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669' }}>₹{paidRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Pending Receivables</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d97706' }}>₹{pendingRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* GENERATE INVOICE FORM */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <PlusCircle size={18} color="var(--primary)" /> Generate Invoice
          </h2>

          {completedJobCards.length === 0 ? (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              No completed job cards pending invoice generation. Mark a job card as <strong>Completed</strong> first.
            </p>
          ) : (
            <form onSubmit={handleGenerateInvoice}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Select Completed Job Card</label>
                <select 
                  className="form-control"
                  value={selectedJobCardId}
                  onChange={(e) => setSelectedJobCardId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Job Card --</option>
                  {completedJobCards.map(jc => (
                    <option key={jc.id} value={jc.id}>
                      Job Card #{jc.id} - {jc.vehicle_number} ({jc.customer_name})
                    </option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                disabled={generating || !selectedJobCardId}
              >
                {generating ? 'Calculating & Generating...' : 'Generate Official Invoice'}
              </button>
            </form>
          )}
        </div>

        {/* INVOICES LIST & SEARCH */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
            <h2 className="card-title" style={{ margin: 0 }}>Invoices Registry</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  placeholder="Search invoice or vehicle..."
                  className="form-control"
                  style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              <select 
                className="form-control" 
                style={{ fontSize: '0.85rem', width: 'auto' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Loading invoices...</p>
          ) : filteredInvoices.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No invoices found matching criteria.</p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Inv #</th>
                    <th>Job Card</th>
                    <th>Customer & Vehicle</th>
                    <th>Service Fee</th>
                    <th>Parts Fee</th>
                    <th>Total (inc. GST)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>#{inv.id}</td>
                      <td>Job Card #{inv.job_card_id}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{inv.customer_name || 'Customer'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.vehicle_number}</div>
                      </td>
                      <td>₹{Number(inv.service_charges ?? inv.service_charge ?? 0).toLocaleString()}</td>
                      <td>₹{Number(inv.parts_charges ?? inv.spare_parts_charge ?? 0).toLocaleString()}</td>
                      <td style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                        ₹{Number(inv.total_amount || 0).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${inv.payment_status === 'Paid' ? 'badge-completed' : 'badge-pending'}`}>
                          {inv.payment_status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                            onClick={() => setSelectedInvoice(inv)}
                          >
                            <FileText size={14} /> View
                          </button>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '4px 8px', fontSize: '0.78rem', background: inv.payment_status === 'Paid' ? '#6b7280' : 'var(--primary)' }}
                            onClick={() => handlePaymentUpdate(inv.id, inv.payment_status)}
                          >
                            {inv.payment_status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PRINTABLE INVOICE MODAL / VIEW */}
      {selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--primary)' }}>AutoCare Pro Service Center</h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Authorized Automotive Diagnostic & Workshop</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>TAX INVOICE</h3>
                <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Invoice #{selectedInvoice.id}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Date: {selectedInvoice.created_at ? new Date(selectedInvoice.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '20px', gap: '16px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Billed To:</strong>
                <div style={{ fontWeight: '700', fontSize: '1rem', marginTop: '4px' }}>{selectedInvoice.customer_name || 'Customer'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone: {selectedInvoice.customer_phone || 'N/A'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vehicle Details:</strong>
                <div style={{ fontWeight: '700', fontSize: '1rem', marginTop: '4px' }}>{selectedInvoice.vehicle_number}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selectedInvoice.brand} {selectedInvoice.model} ({selectedInvoice.fuel_type || 'Gasoline'})
                </div>
              </div>
            </div>

            <table className="custom-table" style={{ marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Labor & Diagnostics Service Charge</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Service Work Order #{selectedInvoice.job_card_id}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>
                    ₹{Number(selectedInvoice.service_charges ?? selectedInvoice.service_charge ?? 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Spare Parts & Consumables Total</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Parts used during maintenance</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>
                    ₹{Number(selectedInvoice.parts_charges ?? selectedInvoice.spare_parts_charge ?? 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ width: '100%', maxWidth: '300px', marginLeft: 'auto', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' }}>
                <span>Subtotal:</span>
                <span>₹{(Number(selectedInvoice.service_charges ?? selectedInvoice.service_charge ?? 0) + Number(selectedInvoice.parts_charges ?? selectedInvoice.spare_parts_charge ?? 0)).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' }}>
                <span>GST (18%):</span>
                <span>₹{Number(selectedInvoice.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid var(--border-color)', fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)' }}>
                <span>Total Amount:</span>
                <span>₹{Number(selectedInvoice.total_amount || 0).toFixed(2)}</span>
              </div>
              <div style={{ textAlign: 'right', marginTop: '4px' }}>
                <span className={`badge ${selectedInvoice.payment_status === 'Paid' ? 'badge-completed' : 'badge-pending'}`}>
                  Payment Status: {selectedInvoice.payment_status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => window.print()}
                style={{ gap: '6px' }}
              >
                <Printer size={16} /> Print Slip
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setSelectedInvoice(null)}
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
