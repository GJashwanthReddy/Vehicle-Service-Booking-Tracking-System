import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CustomerForm from './components/CustomerForm';
import VehicleForm from './components/VehicleForm';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import CustomerList from './components/CustomerList';
import VehicleList from './components/VehicleList';
import TechnicianManager from './components/TechnicianManager';
import JobCardManager from './components/JobCardManager';
import SparePartsManager from './components/SparePartsManager';
import InvoiceManager from './components/InvoiceManager';
import ServiceHistoryView from './components/ServiceHistoryView';

import { getCustomers, getVehicles, getBookings } from './api';
import { RefreshCw, Users, Car, CalendarCheck, Wrench, Package, FileText, UserCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminSubTab, setAdminSubTab] = useState('job-cards');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [cData, vData, bData] = await Promise.all([
        getCustomers().catch(() => ({ data: [] })),
        getVehicles().catch(() => ({ data: [] })),
        getBookings().catch(() => ({ data: [] }))
      ]);

      setCustomers(cData.data || []);
      setVehicles(vData.data || []);
      setBookings(bData.data || []);
    } catch (err) {
      console.error('Error fetching data from API server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <div>
      {/* Top Commercial Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <div className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw className="spin" size={28} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <p>Connecting to Service Management System...</p>
          </div>
        ) : (
          <div>
            {/* CUSTOMER VIEWS */}
            {activeTab === 'dashboard' && (
              <DashboardView 
                customers={customers}
                vehicles={vehicles}
                bookings={bookings}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'my-bookings' && (
              <BookingList bookings={bookings} onRefresh={loadAllData} />
            )}

            {activeTab === 'book-service' && (
              <BookingForm 
                customers={customers} 
                vehicles={vehicles} 
                onBookingAdded={() => {
                  loadAllData();
                  setActiveTab('my-bookings');
                }} 
              />
            )}

            {activeTab === 'vehicles' && (
              <div>
                <VehicleForm 
                  customers={customers} 
                  onVehicleAdded={() => {
                    loadAllData();
                    setActiveTab('book-service');
                  }} 
                  onNavigateToCustomer={() => setActiveTab('register-customer')}
                />
                <VehicleList vehicles={vehicles} onRefresh={loadAllData} />
              </div>
            )}

            {(activeTab === 'customers' || activeTab === 'register-customer') && (
              <div>
                <CustomerForm 
                  onCustomerAdded={() => {
                    loadAllData();
                    setActiveTab('vehicles');
                  }} 
                />
                <CustomerList customers={customers} onRefresh={loadAllData} />
              </div>
            )}

            {activeTab === 'service-history' && (
              <ServiceHistoryView />
            )}

            {activeTab === 'invoices' && (
              <InvoiceManager />
            )}

            {/* ADMIN CONSOLE VIEW WITH SUB-NAVIGATION */}
            {activeTab === 'admin' && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginBottom: '24px', 
                  background: '#ffffff', 
                  padding: '8px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap'
                }}>
                  <button 
                    className={`btn ${adminSubTab === 'job-cards' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.85rem', padding: '8px 14px', gap: '6px' }}
                    onClick={() => setAdminSubTab('job-cards')}
                  >
                    <Wrench size={15} /> Job Cards
                  </button>

                  <button 
                    className={`btn ${adminSubTab === 'technicians' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.85rem', padding: '8px 14px', gap: '6px' }}
                    onClick={() => setAdminSubTab('technicians')}
                  >
                    <UserCheck size={15} /> Technicians
                  </button>

                  <button 
                    className={`btn ${adminSubTab === 'spare-parts' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.85rem', padding: '8px 14px', gap: '6px' }}
                    onClick={() => setAdminSubTab('spare-parts')}
                  >
                    <Package size={15} /> Spare Parts Inventory
                  </button>

                  <button 
                    className={`btn ${adminSubTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.85rem', padding: '8px 14px', gap: '6px' }}
                    onClick={() => setAdminSubTab('invoices')}
                  >
                    <FileText size={15} /> Invoicing & Billing
                  </button>

                  <button 
                    className={`btn ${adminSubTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.85rem', padding: '8px 14px', gap: '6px' }}
                    onClick={() => setAdminSubTab('bookings')}
                  >
                    <CalendarCheck size={15} /> Bookings ({bookings.length})
                  </button>

                  <button 
                    className={`btn ${adminSubTab === 'customers' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.85rem', padding: '8px 14px', gap: '6px' }}
                    onClick={() => setAdminSubTab('customers')}
                  >
                    <Users size={15} /> Customers ({customers.length})
                  </button>

                  <button 
                    className={`btn ${adminSubTab === 'vehicles' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.85rem', padding: '8px 14px', gap: '6px' }}
                    onClick={() => setAdminSubTab('vehicles')}
                  >
                    <Car size={15} /> Vehicles ({vehicles.length})
                  </button>
                </div>

                {/* ADMIN SUB-VIEW SECTIONS */}
                {adminSubTab === 'job-cards' && <JobCardManager bookings={bookings} onRefreshParent={loadAllData} />}
                {adminSubTab === 'technicians' && <TechnicianManager />}
                {adminSubTab === 'spare-parts' && <SparePartsManager />}
                {adminSubTab === 'invoices' && <InvoiceManager />}
                {adminSubTab === 'bookings' && <BookingList bookings={bookings} onRefresh={loadAllData} />}
                {adminSubTab === 'customers' && <CustomerList customers={customers} onRefresh={loadAllData} />}
                {adminSubTab === 'vehicles' && <VehicleList vehicles={vehicles} onRefresh={loadAllData} />}
              </div>
            )}
          </div>
        )}

        <footer style={{ textAlign: 'center', marginTop: '40px', padding: '24px 0', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>AutoCare Pro Vehicle Service Management Platform &copy; 2026. Powered by MySQL & Express.js.</p>
        </footer>
      </div>
    </div>
  );
}
