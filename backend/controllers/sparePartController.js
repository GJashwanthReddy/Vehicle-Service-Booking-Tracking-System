const db = require('../config/db');

// Get all spare parts inventory
exports.getAllSpareParts = async (req, res) => {
    try {
        const sql = `SELECT * FROM spare_parts ORDER BY part_name ASC`;
        const parts = await db.query(sql);
        res.status(200).json({ success: true, count: parts.length, data: parts });
    } catch (err) {
        console.error('Error fetching spare parts:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch spare parts', error: err.message });
    }
};

// Add new spare part to inventory
exports.addSparePart = async (req, res) => {
    try {
        let { part_name, part_number, quantity_available, unit_price } = req.body;

        part_name = part_name ? part_name.trim() : '';
        part_number = part_number ? part_number.trim().toUpperCase() : '';

        if (!part_name) {
            return res.status(400).json({ success: false, message: 'Part name is required.' });
        }

        if (!part_number) {
            return res.status(400).json({ success: false, message: 'Part number/SKU is required.' });
        }

        if (quantity_available === undefined || isNaN(quantity_available) || parseInt(quantity_available) < 0) {
            return res.status(400).json({ success: false, message: 'Valid quantity available is required.' });
        }

        if (!unit_price || isNaN(unit_price) || parseFloat(unit_price) <= 0) {
            return res.status(400).json({ success: false, message: 'Valid unit price is required.' });
        }

        // Duplicate part_number check
        const checkSql = `SELECT * FROM spare_parts WHERE part_number = ?`;
        const existing = await db.query(checkSql, [part_number]);
        if (existing && existing.length > 0) {
            return res.status(400).json({ success: false, message: `Part number ${part_number} already exists in inventory.` });
        }

        const insertSql = `
            INSERT INTO spare_parts (part_name, part_number, quantity_available, unit_price)
            VALUES (?, ?, ?, ?)
        `;
        const result = await db.query(insertSql, [
            part_name,
            part_number,
            parseInt(quantity_available),
            parseFloat(unit_price)
        ]);

        const newPart = {
            id: result.insertId,
            part_name,
            part_number,
            quantity_available: parseInt(quantity_available),
            unit_price: parseFloat(unit_price),
            created_at: new Date()
        };

        res.status(201).json({ success: true, message: 'Spare part added successfully', data: newPart });
    } catch (err) {
        console.error('Error adding spare part:', err);
        res.status(500).json({ success: false, message: 'Failed to add spare part', error: err.message });
    }
};

// Update spare part stock quantity
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity_available } = req.body;

        if (quantity_available === undefined || isNaN(quantity_available) || parseInt(quantity_available) < 0) {
            return res.status(400).json({ success: false, message: 'Stock quantity must be zero or a positive integer.' });
        }

        const newQty = parseInt(quantity_available);
        const sql = `UPDATE spare_parts SET quantity_available = ? WHERE id = ?`;
        await db.query(sql, [newQty, id]);

        res.status(200).json({ success: true, message: `Part #${id} stock updated to ${newQty}` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update spare part stock', error: err.message });
    }
};
