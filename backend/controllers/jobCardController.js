const db = require('../config/db');

// Get all Job Cards (with Joined details)
exports.getAllJobCards = async (req, res) => {
    try {
        const sql = `
            SELECT 
                j.id,
                j.booking_id,
                j.vehicle_id,
                v.vehicle_number,
                v.brand,
                v.model,
                j.customer_id,
                c.name AS customer_name,
                c.phone AS customer_phone,
                j.technician_id,
                COALESCE(t.name, 'Unassigned') AS technician_name,
                b.service_type,
                j.problem_description,
                j.work_description,
                j.start_time,
                j.completion_time,
                j.status,
                j.created_at
            FROM job_cards j
            JOIN service_bookings b ON j.booking_id = b.id
            JOIN vehicles v ON j.vehicle_id = v.id
            JOIN customers c ON j.customer_id = c.id
            LEFT JOIN technicians t ON j.technician_id = t.id
            ORDER BY j.created_at DESC
        `;
        const jobCards = await db.query(sql);
        res.status(200).json({ success: true, count: jobCards.length, data: jobCards });
    } catch (err) {
        console.error('Error fetching job cards:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch job cards', error: err.message });
    }
};

// Get single Job Card by ID with used spare parts
exports.getJobCardById = async (req, res) => {
    try {
        const { id } = req.params;
        const jSql = `
            SELECT 
                j.id, j.booking_id, j.vehicle_id, v.vehicle_number, v.brand, v.model,
                j.customer_id, c.name AS customer_name, c.phone AS customer_phone,
                j.technician_id, COALESCE(t.name, 'Unassigned') AS technician_name,
                b.service_type, j.problem_description, j.work_description,
                j.start_time, j.completion_time, j.status, j.created_at
            FROM job_cards j
            JOIN service_bookings b ON j.booking_id = b.id
            JOIN vehicles v ON j.vehicle_id = v.id
            JOIN customers c ON j.customer_id = c.id
            LEFT JOIN technicians t ON j.technician_id = t.id
            WHERE j.id = ?
        `;
        const jobCards = await db.query(jSql, [id]);
        if (!jobCards || jobCards.length === 0) {
            return res.status(404).json({ success: false, message: 'Job Card not found.' });
        }

        const puSql = `
            SELECT pu.id, pu.job_card_id, pu.part_id, sp.part_name, sp.part_number, pu.quantity_used, pu.unit_price, (pu.quantity_used * pu.unit_price) AS line_total
            FROM parts_used pu
            JOIN spare_parts sp ON pu.part_id = sp.id
            WHERE pu.job_card_id = ?
        `;
        const partsUsed = await db.query(puSql, [id]);

        res.status(200).json({
            success: true,
            data: {
                ...jobCards[0],
                parts_used: partsUsed || []
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch job card details', error: err.message });
    }
};

// Create new Job Card from an accepted Service Booking
exports.createJobCard = async (req, res) => {
    try {
        let { booking_id, technician_id, problem_description, work_description } = req.body;

        if (!booking_id) {
            return res.status(400).json({ success: false, message: 'Booking ID is required to create a Job Card.' });
        }

        // Verify booking exists
        const bCheck = await db.query(`SELECT * FROM service_bookings WHERE id = ?`, [booking_id]);
        if (!bCheck || bCheck.length === 0) {
            return res.status(404).json({ success: false, message: `Booking #${booking_id} not found.` });
        }

        const booking = bCheck[0];

        // Check duplicate job card for this booking
        const existingJc = await db.query(`SELECT * FROM job_cards WHERE booking_id = ?`, [booking_id]);
        if (existingJc && existingJc.length > 0) {
            return res.status(400).json({ success: false, message: `Job Card already exists for Booking #${booking_id}` });
        }

        const initialStatus = technician_id ? 'Assigned' : 'Open';

        const insertSql = `
            INSERT INTO job_cards (booking_id, vehicle_id, customer_id, technician_id, problem_description, work_description, start_time, status)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
        `;
        const result = await db.query(insertSql, [
            booking_id,
            booking.vehicle_id,
            booking.customer_id,
            technician_id || null,
            problem_description || booking.notes || 'Service Maintenance Request',
            work_description || 'Initial Inspection',
            initialStatus
        ]);

        // Automatically sync service_bookings status
        await db.query(`UPDATE service_bookings SET status = 'IN_PROGRESS' WHERE id = ?`, [booking_id]);

        // If technician assigned, set technician status to 'Busy'
        if (technician_id) {
            await db.query(`UPDATE technicians SET status = 'Busy' WHERE id = ?`, [technician_id]);
        }

        res.status(201).json({
            success: true,
            message: 'Job Card created successfully and linked to booking',
            data: { id: result.insertId, booking_id, status: initialStatus }
        });
    } catch (err) {
        console.error('Error creating job card:', err);
        res.status(500).json({ success: false, message: 'Failed to create job card', error: err.message });
    }
};

// Update Job Card status & technician assignment
exports.updateJobCard = async (req, res) => {
    try {
        const { id } = req.params;
        const { technician_id, status, work_description } = req.body;

        const checkSql = `SELECT * FROM job_cards WHERE id = ?`;
        const existing = await db.query(checkSql, [id]);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Job Card not found.' });
        }

        const currentJob = existing[0];
        let newStatus = status || currentJob.status;
        let newTechId = technician_id !== undefined ? technician_id : currentJob.technician_id;

        let completionTime = currentJob.completion_time;
        if (newStatus === 'Completed' && !completionTime) {
            completionTime = new Date();
        }

        const updateSql = `
            UPDATE job_cards
            SET technician_id = ?, status = ?, work_description = ?, completion_time = ?
            WHERE id = ?
        `;
        await db.query(updateSql, [newTechId || null, newStatus, work_description || currentJob.work_description, completionTime, id]);

        // Sync booking status & auto-generate invoice on completion
        if (newStatus === 'Completed') {
            await db.query(`UPDATE service_bookings SET status = 'COMPLETED' WHERE id = ?`, [currentJob.booking_id]);
            if (newTechId) {
                await db.query(`UPDATE technicians SET status = 'Available' WHERE id = ?`, [newTechId]);
            }

            // Auto-generate invoice upon service completion if not already generated
            try {
                const bCheck = await db.query(`SELECT * FROM service_bookings WHERE id = ?`, [currentJob.booking_id]);
                const serviceType = bCheck && bCheck.length > 0 ? bCheck[0].service_type : '';
                const stCheck = await db.query(`SELECT * FROM service_types WHERE service_name = ?`, [serviceType]);
                let serviceCharges = stCheck && stCheck.length > 0 ? parseFloat(stCheck[0].estimated_cost) : 1500.00;

                const puRows = await db.query(`SELECT SUM(quantity_used * unit_price) AS parts_total FROM parts_used WHERE job_card_id = ?`, [id]);
                let partsCharges = puRows && puRows.length > 0 && puRows[0].parts_total ? parseFloat(puRows[0].parts_total) : 0.00;

                let subtotal = serviceCharges + partsCharges;
                let taxAmount = parseFloat((subtotal * 0.18).toFixed(2));
                let totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

                const autoInvSql = `
                    INSERT INTO invoices (job_card_id, customer_id, vehicle_id, service_charges, parts_charges, tax_amount, total_amount, payment_status, invoice_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', CURDATE())
                    ON DUPLICATE KEY UPDATE
                        service_charges = VALUES(service_charges),
                        parts_charges = VALUES(parts_charges),
                        tax_amount = VALUES(tax_amount),
                        total_amount = VALUES(total_amount);
                `;
                await db.query(autoInvSql, [id, currentJob.customer_id, currentJob.vehicle_id, serviceCharges, partsCharges, taxAmount, totalAmount]);
            } catch (invErr) {
                console.warn('Auto invoice creation warning:', invErr);
            }
        } else if (newStatus === 'In Service') {
            await db.query(`UPDATE service_bookings SET status = 'IN_PROGRESS' WHERE id = ?`, [currentJob.booking_id]);
        }

        res.status(200).json({ success: true, message: `Job Card #${id} updated successfully` });
    } catch (err) {
        console.error('Error updating job card:', err);
        res.status(500).json({ success: false, message: 'Failed to update job card', error: err.message });
    }
};

// Record Spare Part Used for a Job Card (Triggers stock reduction)
exports.addPartUsed = async (req, res) => {
    try {
        const { job_card_id, part_id, quantity_used } = req.body;

        if (!job_card_id || !part_id || !quantity_used) {
            return res.status(400).json({ success: false, message: 'Job Card ID, Part ID, and Quantity Used are required.' });
        }

        const qty = parseInt(quantity_used);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ success: false, message: 'Quantity used must be a positive number.' });
        }

        // Fetch part unit price & stock check
        const partCheck = await db.query(`SELECT * FROM spare_parts WHERE id = ?`, [part_id]);
        if (!partCheck || partCheck.length === 0) {
            return res.status(404).json({ success: false, message: 'Spare part not found.' });
        }

        const part = partCheck[0];
        if (part.quantity_available < qty) {
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient stock for ${part.part_name}! Available: ${part.quantity_available}, Requested: ${qty}` 
            });
        }

        // Insert parts_used (MySQL Trigger will automatically deduct inventory)
        const insertSql = `
            INSERT INTO parts_used (job_card_id, part_id, quantity_used, unit_price)
            VALUES (?, ?, ?, ?)
        `;
        await db.query(insertSql, [job_card_id, part_id, qty, part.unit_price]);

        res.status(201).json({ 
            success: true, 
            message: `Recorded ${qty} unit(s) of ${part.part_name} used for Job Card #${job_card_id}. Inventory updated.` 
        });
    } catch (err) {
        console.error('Error recording part usage:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to record part usage' });
    }
};
