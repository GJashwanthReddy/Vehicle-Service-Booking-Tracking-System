import React, { useState, useEffect } from 'react';
import { Wrench, PlusCircle, CalendarCheck, UserPlus, ArrowRight, Car, CheckCircle2, ShieldCheck, Disc3, Clock, DollarSign, Activity } from 'lucide-react';
import { getDashboardStats } from '../api';

export default function DashboardView({ customers = [], vehicles = [], bookings = [], onNavigate }) {
  const [dbStats, setDbStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const stats = await getDashboardStats();
      if (stats && stats.success !== false) {
        setDbStats(stats);
      }
    } catch (err) {
      console.warn('Dashboard stats fallback to local props:', err);
    }
  };

  const totalCustomers = dbStats?.totalCustomers ?? customers.length;
  const totalVehicles = dbStats?.totalVehicles ?? vehicles.length;
  const totalBookings = dbStats?.totalBookings ?? bookings.length;
  const pendingBookings = dbStats?.pendingBookings ?? bookings.filter(b => b.status === 'Pending').length;
  const inServiceBookings = dbStats?.inServiceBookings ?? bookings.filter(b => b.status === 'IN_PROGRESS' || b.status === 'In Service').length;
  const completedBookings = dbStats?.completedBookings ?? bookings.filter(b => b.status === 'Completed').length;

  return (
    <div style={{ padding: '24px 0' }}>
      {/* HERO BANNER */}
      <section className="hero-section">
        <div>
          <h1 className="hero-title">Vehicle Service & Maintenance Platform</h1>
          <p className="hero-subtitle">
            Book service appointments, track vehicle repair progress live, and review maintenance history.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => onNavigate('book-service')}>
              <Wrench size={18} />
              Book a Service
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('my-bookings')}>
              <CalendarCheck size={18} />
              Track Booking Status
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <Wrench size={44} color="var(--primary)" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            AutoCare Pro Workshop
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Database-Driven Vehicle Diagnostics & Repair
          </div>
        </div>
      </section>

      {/* METRICS STATS OVERVIEW */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px', color: 'var(--primary)' }}>
            <UserPlus size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Registered Customers</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{totalCustomers}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px', color: 'var(--primary)' }}>
            <Car size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Vehicles On File</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{totalVehicles}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px', color: 'var(--primary)' }}>
            <CalendarCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Work Orders</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{totalBookings}</div>
          </div>
        </div>
      </div>

      {/* LIVE SERVICE TRACKING PIPELINE */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--primary)" /> Live Service Progression Workflow
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Real-time database status lifecycle</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 8px', gap: '8px', overflowX: 'auto' }}>
          {[
            { label: 'BOOKED', count: pendingBookings, desc: 'Initial Request' },
            { label: 'CONFIRMED', count: Math.max(0, totalBookings - pendingBookings - inServiceBookings - completedBookings), desc: 'Accepted by Admin' },
            { label: 'ASSIGNED', count: dbStats?.assignedJobCards || 0, desc: 'Technician Allocated' },
            { label: 'IN SERVICE', count: inServiceBookings, desc: 'Active Workshop Repair' },
            { label: 'COMPLETED', count: completedBookings, desc: 'Job Finished & Invoiced' }
          ].map((step, idx, arr) => (
            <React.Fragment key={step.label}>
              <div style={{
                flex: 1,
                minWidth: '130px',
                textAlign: 'center',
                padding: '14px 10px',
                borderRadius: '8px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', margin: '4px 0' }}>
                  {step.count}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {step.desc}
                </div>
              </div>
              {idx < arr.length - 1 && (
                <ArrowRight size={18} color="var(--border-color)" style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* QUICK ACTION LINKS */}
      <div style={{ marginBottom: '32px' }}>
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-help-grid">
          <a href="#book-service" className="quick-help-card" onClick={(e) => { e.preventDefault(); onNavigate('book-service'); }}>
            <span className="quick-help-icon"><Wrench size={18} /></span>
            <span>Book a Service</span>
          </a>

          <a href="#vehicles" className="quick-help-card" onClick={(e) => { e.preventDefault(); onNavigate('vehicles'); }}>
            <span className="quick-help-icon"><PlusCircle size={18} /></span>
            <span>Register Vehicle</span>
          </a>

          <a href="#service-history" className="quick-help-card" onClick={(e) => { e.preventDefault(); onNavigate('service-history'); }}>
            <span className="quick-help-icon"><Clock size={18} /></span>
            <span>Service History</span>
          </a>

          <a href="#invoices" className="quick-help-card" onClick={(e) => { e.preventDefault(); onNavigate('invoices'); }}>
            <span className="quick-help-icon"><DollarSign size={18} /></span>
            <span>Invoices & Billing</span>
          </a>
        </div>
      </div>

      {/* RECENT BOOKINGS & WORKSHOP SERVICES */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Service Bookings</h2>
            <button 
              className="nav-link" 
              style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }} 
              onClick={() => onNavigate('my-bookings')}
            >
              View All →
            </button>
          </div>

          {bookings.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '24px' }}>
              No recent bookings found.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{b.vehicle_number}</td>
                      <td>{b.customer_name}</td>
                      <td>{b.service_type}</td>
                      <td>
                        <span className={`badge badge-${b.status ? b.status.toLowerCase().replace(' ', '_') : 'pending'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* WORKSHOP SERVICES CATALOGUE */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Service Offerings</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px 16px', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={18} color="var(--primary)" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>Full Periodical Service</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complete 50-point engine inspection & synthetic oil check.</span>
              </div>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Wrench size={18} color="var(--primary)" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>Oil & Filter Replacement</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Engine oil drain, premium oil filter change, and chassis lube.</span>
              </div>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Disc3 size={18} color="var(--primary)" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>Brake Service & Machining</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Brake pad replacement, disc resurfacing & hydraulic fluid flush.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
