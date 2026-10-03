const db = require('../config/db');

// Get all invoices with customer and vehicle details
exports.getAllInvoices = async (req, res) => {
    try {
        const sql = `
            SELECT 
                i.id,
                i.job_card_id,
                i.customer_id,
                c.name AS customer_name,
                c.phone AS customer_phone,
                i.vehicle_id,
                v.vehicle_number,
                v.brand,
                v.model,
                i.service_charges,
                i.parts_charges,
                i.tax_amount,
                i.total_amount,
                i.payment_status,
                i.invoice_date,
                i.created_at
            FROM invoices i
            JOIN customers c ON i.customer_id = c.id
            JOIN vehicles v ON i.vehicle_id = v.id
            ORDER BY i.created_at DESC
        `;
        const invoices = await db.query(sql);
        res.status(200).json({ success: true, count: invoices.length, data: invoices });
    } catch (err) {
        console.error('Error fetching invoices:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch invoices', error: err.message });
    }
};

// Generate Invoice for a completed Job Card
exports.generateInvoice = async (req, res) => {
    try {
        const { job_card_id } = req.body;

        if (!job_card_id) {
            return res.status(400).json({ success: false, message: 'Job Card ID is required to generate invoice.' });
        }

        // Check Job Card exists
        const jcCheck = await db.query(`SELECT * FROM job_cards WHERE id = ?`, [job_card_id]);
        if (!jcCheck || jcCheck.length === 0) {
            return res.status(404).json({ success: false, message: `Job Card #${job_card_id} not found.` });
        }

        const jobCard = jcCheck[0];

        // Fetch Service Type estimated cost
        const bCheck = await db.query(`SELECT * FROM service_bookings WHERE id = ?`, [jobCard.booking_id]);
        const serviceType = bCheck && bCheck.length > 0 ? bCheck[0].service_type : '';
        const stCheck = await db.query(`SELECT * FROM service_types WHERE service_name = ?`, [serviceType]);
        
        let serviceCharges = stCheck && stCheck.length > 0 ? parseFloat(stCheck[0].estimated_cost) : 1500.00;

        // Fetch sum of parts used for this Job Card
        const puRows = await db.query(`SELECT SUM(quantity_used * unit_price) AS parts_total FROM parts_used WHERE job_card_id = ?`, [job_card_id]);
        let partsCharges = puRows && puRows.length > 0 && puRows[0].parts_total ? parseFloat(puRows[0].parts_total) : 0.00;

        // Apply 18% GST tax
        let subtotal = serviceCharges + partsCharges;
        let taxAmount = parseFloat((subtotal * 0.18).toFixed(2));
        let totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

        // Insert or Update invoice
        const insertSql = `
            INSERT INTO invoices (job_card_id, customer_id, vehicle_id, service_charges, parts_charges, tax_amount, total_amount, payment_status, invoice_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', CURDATE())
            ON DUPLICATE KEY UPDATE
                service_charges = VALUES(service_charges),
                parts_charges = VALUES(parts_charges),
                tax_amount = VALUES(tax_amount),
                total_amount = VALUES(total_amount)
        `;
        const result = await db.query(insertSql, [
            job_card_id,
            jobCard.customer_id,
            jobCard.vehicle_id,
            serviceCharges,
            partsCharges,
            taxAmount,
            totalAmount
        ]);

        res.status(201).json({
            success: true,
            message: `Invoice generated successfully for Job Card #${job_card_id}`,
            data: {
                id: result.insertId || 1,
                job_card_id,
                service_charges: serviceCharges,
                parts_charges: partsCharges,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                payment_status: 'Pending',
                invoice_date: new Date().toISOString().split('T')[0]
            }
        });
    } catch (err) {
        console.error('Error generating invoice:', err);
        res.status(500).json({ success: false, message: 'Failed to generate invoice', error: err.message });
    }
};

// Update Payment Status (Pending -> Paid)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        const validStatuses = ['Pending', 'Paid'];
        if (!payment_status || !validStatuses.includes(payment_status)) {
            return res.status(400).json({ success: false, message: `Payment status must be one of: ${validStatuses.join(', ')}` });
        }

        const sql = `UPDATE invoices SET payment_status = ? WHERE id = ?`;
        await db.query(sql, [payment_status, id]);

        res.status(200).json({ success: true, message: `Invoice #${id} payment status updated to ${payment_status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update payment status', error: err.message });
    }
};
