const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');

const customerRoutes = require('./routes/customerRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const serviceTypeRoutes = require('./routes/serviceTypeRoutes');
const technicianRoutes = require('./routes/technicianRoutes');
const jobCardRoutes = require('./routes/jobCardRoutes');
const sparePartRoutes = require('./routes/sparePartRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const serviceHistoryRoutes = require('./routes/serviceHistoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceTypeRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/job-cards', jobCardRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/service-history', serviceHistoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Database connection status check endpoint
app.get('/api/status', (req, res) => {
    res.json({
        project: 'Vehicle Service Booking & Tracking System - Final Expo Edition',
        course: 'Database Systems Engineering & Distributed Backend Development (25CS1302E)',
        team: ['2520030426 - G Jashwanth Reddy', '2520030382 - Mohammad Zaid Amaan'],
        mysqlConnected: db.getIsConnected(),
        status: 'Server Operational',
        endpoints: [
            '/api/customers',
            '/api/vehicles',
            '/api/services',
            '/api/bookings',
            '/api/technicians',
            '/api/job-cards',
            '/api/spare-parts',
            '/api/invoices',
            '/api/service-history',
            '/api/dashboard/stats'
        ]
    });
});

// Serve frontend static build if available
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendBuildPath));

app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
        if (err) {
            res.status(200).send(`
                <h2>Vehicle Service Booking & Tracking System API Server Running on port ${PORT}</h2>
                <p>Course: 25CS1302E | Team: G Jashwanth Reddy & Mohammad Zaid Amaan</p>
                <p>Final Expo Edition API Active</p>
            `);
        }
    });
});

app.listen(PORT, () => {
    console.log(`==================================================================`);
    console.log(`  VEHICLE SERVICE SYSTEM BACKEND STARTED ON PORT ${PORT}`);
    console.log(`  FINAL PROJECT EXPO EDITION READY`);
    console.log(`  Team: G Jashwanth Reddy (2520030426) & Mohammad Zaid Amaan (2520030382)`);
    console.log(`  API Base URL: http://localhost:${PORT}/api`);
    console.log(`==================================================================`);
});
