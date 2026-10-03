const db = require('../config/db');

// Phone Validation Regex
const PHONE_REGEX = /^[6-9]\d{9}$/;

// Get all technicians
exports.getAllTechnicians = async (req, res) => {
    try {
        const sql = `SELECT * FROM technicians ORDER BY name ASC`;
        const technicians = await db.query(sql);
        res.status(200).json({ success: true, count: technicians.length, data: technicians });
    } catch (err) {
        console.error('Error fetching technicians:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch technicians', error: err.message });
    }
};

// Add new technician
exports.addTechnician = async (req, res) => {
    try {
        let { name, phone, specialization, status } = req.body;

        name = name ? name.trim() : '';
        phone = phone ? phone.trim() : '';
        specialization = specialization ? specialization.trim() : 'General Maintenance';
        status = status ? status.trim() : 'Available';

        if (!name) {
            return res.status(400).json({ success: false, message: 'Technician name is required.' });
        }

        if (!phone || !PHONE_REGEX.test(phone)) {
            return res.status(400).json({ success: false, message: 'Valid 10-digit phone number is required.' });
        }

        const insertSql = `
            INSERT INTO technicians (name, phone, specialization, status)
            VALUES (?, ?, ?, ?)
        `;
        const result = await db.query(insertSql, [name, phone, specialization, status]);

        const newTech = {
            id: result.insertId,
            name,
            phone,
            specialization,
            status,
            created_at: new Date()
        };

        res.status(201).json({ success: true, message: 'Technician added successfully', data: newTech });
    } catch (err) {
        console.error('Error adding technician:', err);
        res.status(500).json({ success: false, message: 'Failed to add technician', error: err.message });
    }
};

// Update technician status (e.g., Available, Busy, On Leave)
exports.updateTechnicianStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Available', 'Busy', 'On Leave'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
        }

        const sql = `UPDATE technicians SET status = ? WHERE id = ?`;
        await db.query(sql, [status, id]);

        res.status(200).json({ success: true, message: `Technician #${id} status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update technician status', error: err.message });
    }
};
