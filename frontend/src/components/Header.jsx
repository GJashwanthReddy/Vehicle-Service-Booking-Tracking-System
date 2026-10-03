import React, { useState } from 'react';
import { Wrench, Info, X, ShieldCheck } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="header-container">
          {/* Commercial Brand Logo */}
          <a href="#dashboard" className="brand-logo" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
            <span className="brand-icon">
              <Wrench size={22} />
            </span>
            <span>AutoCare Pro</span>
          </a>

          {/* Clean Professional Navigation Links */}
          <nav className="nav-links">
            <button 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>

            <button 
              className={`nav-link ${activeTab === 'customers' || activeTab === 'register-customer' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              Customers
            </button>

            <button 
              className={`nav-link ${activeTab === 'vehicles' ? 'active' : ''}`}
              onClick={() => setActiveTab('vehicles')}
            >
              Vehicles
            </button>

            <button 
              className={`nav-link ${activeTab === 'book-service' ? 'active' : ''}`}
              onClick={() => setActiveTab('book-service')}
            >
              Book Service
            </button>

            <button 
              className={`nav-link ${activeTab === 'my-bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-bookings')}
            >
              My Bookings
            </button>

            <button 
              className={`nav-link ${activeTab === 'service-history' ? 'active' : ''}`}
              onClick={() => setActiveTab('service-history')}
            >
              Service History
            </button>

            <button 
              className={`nav-link ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              Invoices
            </button>

            <button 
              className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: activeTab === 'admin' ? 'var(--primary)' : 'rgba(37, 99, 235, 0.08)', color: activeTab === 'admin' ? '#fff' : 'var(--primary)', fontWeight: '600' }}
              onClick={() => setActiveTab('admin')}
            >
              <ShieldCheck size={14} />
              Admin Console
            </button>

            <button 
              className="nav-link" 
              onClick={() => setShowInfoModal(true)}
            >
              About
            </button>
          </nav>
        </div>
      </header>

      {/* Commercial Service Center About Modal */}
      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: '800' }}>AutoCare Pro Service Management</h3>
              <button 
                onClick={() => setShowInfoModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color)', fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--text-main)' }}>AutoCare Pro Vehicle Service System</strong> is an end-to-end automotive management platform designed for complete vehicle maintenance workflows.
              </p>
              <p>
                Features: Customer Onboarding, Vehicle Fleet Management, Service Type Catalogue, Job Cards, Technician Allocation, Spare Parts Inventory, Automated Stock Triggers, Invoicing, and Joined Service History.
              </p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowInfoModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
