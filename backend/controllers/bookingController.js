const db = require('../config/db');

// Get all service bookings
exports.getAllBookings = async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.id,
                b.customer_id,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email,
                b.vehicle_id,
                v.vehicle_number,
                v.brand,
                v.model,
                CONCAT(v.brand, ' ', v.model) as vehicle_details,
                v.fuel_type,
                b.service_type,
                b.booking_date,
                b.preferred_slot,
                b.status,
                b.notes,
                b.created_at
            FROM service_bookings b
            JOIN customers c ON b.customer_id = c.id
            JOIN vehicles v ON b.vehicle_id = v.id
            ORDER BY b.created_at DESC
        `;
        const bookings = await db.query(sql);
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        console.error('Error fetching service bookings:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch service bookings from database', error: err.message });
    }
};

// Create new service booking
exports.createBooking = async (req, res) => {
    try {
        let { customer_id, vehicle_id, service_type, booking_date, preferred_slot, notes } = req.body;

        if (!customer_id) {
            return res.status(400).json({ success: false, message: 'Please select a customer for the booking.' });
        }

        if (!vehicle_id) {
            return res.status(400).json({ success: false, message: 'Please select a registered vehicle for the service.' });
        }

        if (!service_type) {
            return res.status(400).json({ success: false, message: 'Service type is required.' });
        }

        if (!booking_date) {
            return res.status(400).json({ success: false, message: 'Booking date is required.' });
        }

        if (!preferred_slot) {
            return res.status(400).json({ success: false, message: 'Preferred time slot is required.' });
        }

        // Verify customer & vehicle exist in database
        const custCheck = await db.query(`SELECT * FROM customers WHERE id = ?`, [customer_id]);
        if (!custCheck || custCheck.length === 0) {
            return res.status(404).json({ success: false, message: `Customer ID ${customer_id} not found.` });
        }

        const vehCheck = await db.query(`SELECT * FROM vehicles WHERE id = ?`, [vehicle_id]);
        if (!vehCheck || vehCheck.length === 0) {
            return res.status(404).json({ success: false, message: `Vehicle ID ${vehicle_id} not found.` });
        }

        // Verify vehicle belongs to customer
        if (vehCheck[0].customer_id != customer_id) {
            return res.status(400).json({ 
                success: false, 
                message: `Selected vehicle (${vehCheck[0].vehicle_number}) does not belong to selected customer (${custCheck[0].name}).` 
            });
        }

        const insertSql = `
            INSERT INTO service_bookings (customer_id, vehicle_id, service_type, booking_date, preferred_slot, status, notes)
            VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
        `;
        const result = await db.query(insertSql, [
            customer_id,
            vehicle_id,
            service_type.trim(),
            booking_date,
            preferred_slot.trim(),
            notes ? notes.trim() : ''
        ]);

        const newBooking = {
            id: result.insertId,
            customer_id,
            customer_name: custCheck[0].name,
            customer_phone: custCheck[0].phone,
            vehicle_id,
            vehicle_number: vehCheck[0].vehicle_number,
            vehicle_details: `${vehCheck[0].brand} ${vehCheck[0].model}`,
            service_type: service_type.trim(),
            booking_date,
            preferred_slot: preferred_slot.trim(),
            status: 'PENDING',
            notes: notes ? notes.trim() : '',
            created_at: new Date()
        };

        res.status(201).json({ 
            success: true, 
            message: 'Service booking created successfully and persisted in database', 
            data: newBooking 
        });
    } catch (err) {
        console.error('Error creating service booking:', err);
        res.status(500).json({ success: false, message: 'Failed to create service booking', error: err.message });
    }
};

// Update service booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
        if (!status || !validStatuses.includes(status.toUpperCase())) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid booking status. Allowed: ${validStatuses.join(', ')}` 
            });
        }

        const upperStatus = status.toUpperCase();
        const updateSql = `UPDATE service_bookings SET status = ? WHERE id = ?`;
        const result = await db.query(updateSql, [upperStatus, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: `Booking #${id} not found.` });
        }

        res.status(200).json({ 
            success: true, 
            message: `Booking #${id} status updated to ${upperStatus} in database`,
            data: { id: Number(id), status: upperStatus }
        });
    } catch (err) {
        console.error('Error updating booking status:', err);
        res.status(500).json({ success: false, message: 'Failed to update booking status', error: err.message });
    }
};
