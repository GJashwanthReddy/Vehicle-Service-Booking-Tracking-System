import React, { useState, useEffect } from 'react';
import { getServiceHistory } from '../api';
import { History, Search, Car, Calendar, User, Wrench, CheckCircle2, FileText, RefreshCw } from 'lucide-react';

export default function ServiceHistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async (vehicleNumber = '') => {
    setLoading(true);
    try {
      const res = await getServiceHistory({ vehicle_number: vehicleNumber, search: vehicleNumber });
      setHistory(res.data || res || []);
    } catch (err) {
      console.error('Failed to fetch service history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadHistory(searchTerm);
  };

  const filteredHistory = history.filter(item => {
    if (!searchTerm) return true;
    const rawTerm = searchTerm.toLowerCase().trim();
    const cleanTerm = rawTerm.replace(/\s+/g, '');

    const vNum = (item.vehicle_number || '').toLowerCase();
    const vClean = vNum.replace(/\s+/g, '');
    const cust = (item.customer_name || '').toLowerCase();
    const serv = (item.service_name || item.service_type || '').toLowerCase();
    const tech = (item.technician_name || '').toLowerCase();

    return (
      vNum.includes(rawTerm) ||
      (cleanTerm && vClean.includes(cleanTerm)) ||
      cust.includes(rawTerm) ||
      serv.includes(rawTerm) ||
      tech.includes(rawTerm)
    );
  });

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Vehicle Service History Log</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Comprehensive maintenance records retrieved from MySQL Database View <code style={{ fontSize: '0.85rem' }}>vw_vehicle_service_history</code>.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => loadHistory('')} style={{ gap: '6px' }}>
          <RefreshCw size={16} /> Refresh Log
        </button>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              className="form-control"
              placeholder="Search by Vehicle Number, Customer Name, or Technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
            Filter Records
          </button>
          {searchTerm && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => { setSearchTerm(''); loadHistory(''); }}
              style={{ height: '42px' }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* SERVICE HISTORY TABLE */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="var(--primary)" /> Maintenance Audit Trail
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            Showing {filteredHistory.length} Recorded Services
          </span>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Fetching vehicle service history...</p>
        ) : filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Car size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ margin: 0, fontWeight: '600' }}>No service history records found.</p>
            <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0' }}>Try searching for a different vehicle license plate or customer name.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle Number</th>
                  <th>Customer</th>
                  <th>Service Performed</th>
                  <th>Assigned Technician</th>
                  <th>Work & Status</th>
                  <th>Invoice Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        {new Date(item.booking_date || item.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{item.vehicle_number}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {item.brand} {item.model}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.customer_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.customer_phone || 'N/A'}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600' }}>{item.service_name || item.service_type}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                        {item.technician_name || 'Unassigned'}
                      </div>
                    </td>
                    <td>
                      <div style={{ marginBottom: '4px' }}>
                        <span className={`badge badge-${item.job_status ? item.job_status.toLowerCase().replace(' ', '_') : 'completed'}`}>
                          {item.job_status || item.booking_status || 'Completed'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.work_description || item.problem_description || 'Routine service'}
                      </div>
                    </td>
                    <td style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                      ₹{item.total_amount ? Number(item.total_amount).toLocaleString() : (item.estimated_cost ? Number(item.estimated_cost).toLocaleString() : 'N/A')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
