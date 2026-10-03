const db = require('../config/db');

// Get Service History (all or filtered by vehicle_id / search term with space tolerance)
exports.getServiceHistory = async (req, res) => {
    try {
        const { vehicle_id, vehicle_number, search } = req.query;
        const searchTerm = (search || vehicle_number || '').trim();

        let sql = `SELECT * FROM vw_vehicle_service_history`;
        let params = [];

        if (vehicle_id) {
            sql += ` WHERE vehicle_id = ?`;
            params.push(vehicle_id);
        } else if (searchTerm) {
            const rawTerm = `%${searchTerm.toUpperCase()}%`;
            const cleanTerm = `%${searchTerm.replace(/\s+/g, '').toUpperCase()}%`;
            sql += ` WHERE (
                UPPER(vehicle_number) LIKE ? OR 
                REPLACE(UPPER(vehicle_number), ' ', '') LIKE ? OR 
                UPPER(customer_name) LIKE ? OR 
                UPPER(technician_name) LIKE ? OR 
                UPPER(service_type) LIKE ?
            )`;
            params.push(rawTerm, cleanTerm, rawTerm, rawTerm, rawTerm);
        }

        sql += ` ORDER BY created_at DESC`;

        const history = await db.query(sql, params);
        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (err) {
        console.error('Error fetching service history:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch service history', error: err.message });
    }
};
