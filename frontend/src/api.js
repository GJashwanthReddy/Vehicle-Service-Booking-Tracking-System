import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getStatus = async () => {
  const res = await api.get('/status');
  return res.data;
};

// Customers API
export const getCustomers = async () => {
  const res = await api.get('/customers');
  return res.data;
};

export const createCustomer = async (customerData) => {
  const res = await api.post('/customers', customerData);
  return res.data;
};

export const deleteCustomer = async (id) => {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
};

// Vehicles API
export const getVehicles = async () => {
  const res = await api.get('/vehicles');
  return res.data;
};

export const getVehiclesByCustomer = async (customerId) => {
  const res = await api.get(`/vehicles/customer/${customerId}`);
  return res.data;
};

export const createVehicle = async (vehicleData) => {
  const res = await api.post('/vehicles', vehicleData);
  return res.data;
};

export const deleteVehicle = async (id) => {
  const res = await api.delete(`/vehicles/${id}`);
  return res.data;
};

// Service Types Catalogue API
export const getServices = async () => {
  const res = await api.get('/services');
  return res.data;
};

export const createServiceType = async (serviceData) => {
  const res = await api.post('/services', serviceData);
  return res.data;
};

// Service Bookings API
export const getBookings = async () => {
  const res = await api.get('/bookings');
  return res.data;
};

export const createBooking = async (bookingData) => {
  const res = await api.post('/bookings', bookingData);
  return res.data;
};

export const updateBookingStatus = async (id, status) => {
  const res = await api.put(`/bookings/${id}/status`, { status });
  return res.data;
};

// Technicians API
export const getTechnicians = async () => {
  const res = await api.get('/technicians');
  return res.data;
};

export const createTechnician = async (techData) => {
  const res = await api.post('/technicians', techData);
  return res.data;
};

export const updateTechnicianStatus = async (id, status) => {
  const res = await api.put(`/technicians/${id}/status`, { status });
  return res.data;
};

// Job Cards API
export const getJobCards = async () => {
  const res = await api.get('/job-cards');
  return res.data;
};

export const getJobCardById = async (id) => {
  const res = await api.get(`/job-cards/${id}`);
  return res.data;
};

export const createJobCard = async (jobCardData) => {
  const res = await api.post('/job-cards', jobCardData);
  return res.data;
};

export const updateJobCard = async (id, updateData) => {
  const res = await api.put(`/job-cards/${id}`, updateData);
  return res.data;
};

export const addPartUsed = async (partUsageData) => {
  const res = await api.post('/job-cards/parts-used', partUsageData);
  return res.data;
};

// Spare Parts API
export const getSpareParts = async () => {
  const res = await api.get('/spare-parts');
  return res.data;
};

export const createSparePart = async (partData) => {
  const res = await api.post('/spare-parts', partData);
  return res.data;
};

export const updateSparePartStock = async (id, quantity_available) => {
  const res = await api.put(`/spare-parts/${id}/stock`, { quantity_available });
  return res.data;
};

// Invoices API
export const getInvoices = async () => {
  const res = await api.get('/invoices');
  return res.data;
};

export const generateInvoice = async (jobCardId) => {
  const res = await api.post('/invoices/generate', { job_card_id: jobCardId });
  return res.data;
};

export const updatePaymentStatus = async (id, payment_status) => {
  const res = await api.put(`/invoices/${id}/payment`, { payment_status });
  return res.data;
};

// Service History API (MySQL View / Stored Procedure)
export const getServiceHistory = async (params = {}) => {
  const res = await api.get('/service-history', { params });
  return res.data;
};

// Dashboard Stats API
export const getDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

export default api;
