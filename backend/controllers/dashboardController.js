const db = require('../config/db');

// Get Real Aggregated Dashboard Statistics from MySQL database
exports.getDashboardStats = async (req, res) => {
    try {
        const customersRes = await db.query(`SELECT COUNT(*) AS total FROM customers`);
        const vehiclesRes = await db.query(`SELECT COUNT(*) AS total FROM vehicles`);
        const bookingsRes = await db.query(`SELECT COUNT(*) AS total FROM service_bookings`);
        const pendingRes = await db.query(`SELECT COUNT(*) AS total FROM service_bookings WHERE status = 'PENDING'`);
        const inProgressRes = await db.query(`SELECT COUNT(*) AS total FROM service_bookings WHERE status = 'IN_PROGRESS'`);
        const completedRes = await db.query(`SELECT COUNT(*) AS total FROM service_bookings WHERE status = 'COMPLETED'`);
        const jobCardsRes = await db.query(`SELECT COUNT(*) AS total FROM job_cards WHERE status IN ('Open', 'Assigned', 'In Service')`);
        const revenueRes = await db.query(`SELECT COALESCE(SUM(total_amount), 0.00) AS total FROM invoices WHERE payment_status = 'Paid'`);

        const stats = {
            totalCustomers: customersRes && customersRes.length ? customersRes[0].total : 0,
            totalVehicles: vehiclesRes && vehiclesRes.length ? vehiclesRes[0].total : 0,
            totalBookings: bookingsRes && bookingsRes.length ? bookingsRes[0].total : 0,
            pendingServices: pendingRes && pendingRes.length ? pendingRes[0].total : 0,
            servicesInProgress: inProgressRes && inProgressRes.length ? inProgressRes[0].total : 0,
            completedServices: completedRes && completedRes.length ? completedRes[0].total : 0,
            activeJobCards: jobCardsRes && jobCardsRes.length ? jobCardsRes[0].total : 0,
            totalRevenue: revenueRes && revenueRes.length ? parseFloat(revenueRes[0].total) : 0.00
        };

        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        console.error('Error calculating dashboard stats:', err);
        res.status(500).json({ success: false, message: 'Failed to compute dashboard stats', error: err.message });
    }
};
