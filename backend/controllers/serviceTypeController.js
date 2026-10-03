const db = require('../config/db');

// Get all service types from MySQL database
exports.getAllServiceTypes = async (req, res) => {
    try {
        const sql = `SELECT * FROM service_types ORDER BY estimated_cost ASC`;
        const services = await db.query(sql);
        res.status(200).json({ success: true, count: services.length, data: services });
    } catch (err) {
        console.error('Error fetching service types:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch service types from database', error: err.message });
    }
};

// Add new service type
exports.addServiceType = async (req, res) => {
    try {
        let { service_name, description, estimated_cost, estimated_duration } = req.body;

        service_name = service_name ? service_name.trim() : '';
        description = description ? description.trim() : '';
        estimated_duration = estimated_duration ? estimated_duration.trim() : '2 Hours';

        if (!service_name) {
            return res.status(400).json({ success: false, message: 'Service name is required.' });
        }

        if (!estimated_cost || isNaN(estimated_cost) || parseFloat(estimated_cost) <= 0) {
            return res.status(400).json({ success: false, message: 'Valid estimated cost is required.' });
        }

        const insertSql = `
            INSERT INTO service_types (service_name, description, estimated_cost, estimated_duration)
            VALUES (?, ?, ?, ?)
        `;
        const result = await db.query(insertSql, [
            service_name,
            description,
            parseFloat(estimated_cost),
            estimated_duration
        ]);

        const newService = {
            id: result.insertId,
            service_name,
            description,
            estimated_cost: parseFloat(estimated_cost),
            estimated_duration,
            created_at: new Date()
        };

        res.status(201).json({ success: true, message: 'Service type added successfully', data: newService });
    } catch (err) {
        console.error('Error adding service type:', err);
        res.status(500).json({ success: false, message: 'Failed to add service type', error: err.message });
    }
};
