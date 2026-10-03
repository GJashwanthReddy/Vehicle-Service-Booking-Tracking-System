const db = require('../config/db');

// Flexible Vehicle Registration Number Regex (accepts AP 09 AB 1234, TS09EF9012, TS-09-1234, etc.)
const VEHICLE_NUM_REGEX = /^[A-Z0-9\s\-]{4,15}$/i;

// Get all vehicles (with owner customer details)
exports.getAllVehicles = async (req, res) => {
    try {
        const sql = `
            SELECT v.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
            FROM vehicles v
            JOIN customers c ON v.customer_id = c.id
            ORDER BY v.created_at DESC
        `;
        const vehicles = await db.query(sql);
        res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
    } catch (err) {
        console.error('Error fetching vehicles:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch vehicles from database', error: err.message });
    }
};

// Get vehicles by customer ID
exports.getVehiclesByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const sql = `SELECT * FROM vehicles WHERE customer_id = ? ORDER BY created_at DESC`;
        const vehicles = await db.query(sql, [customerId]);
        res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch customer vehicles', error: err.message });
    }
};

// Add new vehicle linked to an existing customer
exports.addVehicle = async (req, res) => {
    try {
        let { customer_id, vehicle_number, brand, model, fuel_type, manufacture_year } = req.body;

        if (!customer_id) {
            return res.status(400).json({ success: false, message: 'Please select a registered customer for this vehicle.' });
        }

        vehicle_number = vehicle_number ? vehicle_number.trim().toUpperCase() : '';
        brand = brand ? brand.trim() : '';
        model = model ? model.trim() : '';
        fuel_type = fuel_type ? fuel_type.trim().toUpperCase() : 'PETROL';

        if (!vehicle_number) {
            return res.status(400).json({ success: false, message: 'Vehicle registration number is required.' });
        }

        if (!brand) {
            return res.status(400).json({ success: false, message: 'Vehicle brand/make is required.' });
        }

        if (!model) {
            return res.status(400).json({ success: false, message: 'Vehicle model is required.' });
        }

        // Flexible vehicle number format check
        if (!VEHICLE_NUM_REGEX.test(vehicle_number)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid vehicle number format! Please enter a valid vehicle number (e.g. AP 09 AB 1234).' 
            });
        }

        // Verify customer exists in database
        const custCheck = await db.query(`SELECT * FROM customers WHERE id = ?`, [customer_id]);
        if (!custCheck || custCheck.length === 0) {
            return res.status(404).json({ success: false, message: `Selected customer (ID #${customer_id}) does not exist.` });
        }

        // Check duplicate vehicle number
        const checkSql = `SELECT * FROM vehicles WHERE vehicle_number = ?`;
        const existingVeh = await db.query(checkSql, [vehicle_number]);
        if (existingVeh && existingVeh.length > 0) {
            return res.status(400).json({ success: false, message: `Vehicle with registration number ${vehicle_number} is already registered.` });
        }

        const insertSql = `
            INSERT INTO vehicles (customer_id, vehicle_number, brand, model, fuel_type, manufacture_year)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const result = await db.query(insertSql, [
            customer_id,
            vehicle_number,
            brand,
            model,
            fuel_type,
            manufacture_year || new Date().getFullYear()
        ]);

        const newVehicle = {
            id: result.insertId,
            customer_id: Number(customer_id),
            customer_name: custCheck[0].name,
            vehicle_number,
            brand,
            model,
            fuel_type,
            manufacture_year: manufacture_year || new Date().getFullYear(),
            created_at: new Date()
        };

        res.status(201).json({ 
            success: true, 
            message: 'Vehicle added successfully and linked to customer in database', 
            data: newVehicle 
        });
    } catch (err) {
        console.error('Error adding vehicle:', err);
        res.status(500).json({ success: false, message: 'Failed to add vehicle', error: err.message });
    }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const checkSql = `SELECT * FROM vehicles WHERE id = ?`;
        const existing = await db.query(checkSql, [id]);
        
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found.' });
        }

        const deleteSql = `DELETE FROM vehicles WHERE id = ?`;
        await db.query(deleteSql, [id]);

        res.status(200).json({ success: true, message: 'Vehicle deleted successfully.' });
    } catch (err) {
        console.error('Error deleting vehicle:', err);
        res.status(500).json({ success: false, message: 'Failed to delete vehicle', error: err.message });
    }
};
