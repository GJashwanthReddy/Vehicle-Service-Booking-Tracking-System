const db = require('../config/db');

// Phone Validation Regex: Exactly 10 digits starting with 6-9
const PHONE_REGEX = /^[6-9]\d{9}$/;
// Email Validation Regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper function to verify no single digit occurs more than 4 times
const hasMaxFourSameDigits = (phoneStr) => {
    const counts = {};
    for (const char of phoneStr) {
        counts[char] = (counts[char] || 0) + 1;
        if (counts[char] > 4) {
            return false;
        }
    }
    return true;
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const sql = `SELECT * FROM customers ORDER BY created_at DESC`;
        const customers = await db.query(sql);
        res.status(200).json({ success: true, count: customers.length, data: customers });
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch customers from database', error: err.message });
    }
};

// Get single customer by ID
exports.getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM customers WHERE id = ?`;
        const customers = await db.query(sql, [id]);
        
        if (!customers || customers.length === 0) {
            return res.status(404).json({ success: false, message: `Customer not found with ID ${id}` });
        }
        res.status(200).json({ success: true, data: customers[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch customer', error: err.message });
    }
};

// Register new customer with strict validation
exports.registerCustomer = async (req, res) => {
    try {
        let { name, email, phone, address } = req.body;

        // 1. Sanitize & trim inputs
        name = name ? name.trim() : '';
        email = email ? email.trim().toLowerCase() : '';
        phone = phone ? phone.trim() : '';
        address = address ? address.trim() : '';

        // 2. Validate empty fields & name format
        if (!name) {
            return res.status(400).json({ success: false, message: 'Full Name is required.' });
        }

        if (/\d/.test(name)) {
            return res.status(400).json({ success: false, message: 'Full Name should not contain numbers.' });
        }

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address is required.' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address (e.g. user@example.com).' });
        }

        // 3. Strict Phone Number Validation
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required.' });
        }

        if (!PHONE_REGEX.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid phone number! Phone number must be exactly 10 digits starting with 6, 7, 8, or 9 without letters, spaces, or special characters (e.g., 9876543210).' 
            });
        }

        // 4. Project-Level Validation: Max 4 occurrences of any single digit
        if (!hasMaxFourSameDigits(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Phone number cannot contain the same digit more than 4 times.' 
            });
        }

        // 5. Check duplicate email
        const checkSql = `SELECT * FROM customers WHERE email = ?`;
        const existing = await db.query(checkSql, [email]);
        if (existing && existing.length > 0) {
            return res.status(400).json({ success: false, message: 'A customer with this email address is already registered.' });
        }

        // 6. Database Insertion
        const insertSql = `INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)`;
        const result = await db.query(insertSql, [name, email, phone, address]);

        const newCustomer = {
            id: result.insertId,
            name,
            email,
            phone,
            address,
            created_at: new Date()
        };

        res.status(201).json({ 
            success: true, 
            message: 'Customer registered successfully in database', 
            data: newCustomer 
        });
    } catch (err) {
        console.error('Error registering customer:', err);
        res.status(500).json({ success: false, message: 'Failed to register customer', error: err.message });
    }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const checkSql = `SELECT * FROM customers WHERE id = ?`;
        const existing = await db.query(checkSql, [id]);
        
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        const deleteSql = `DELETE FROM customers WHERE id = ?`;
        await db.query(deleteSql, [id]);

        res.status(200).json({ success: true, message: 'Customer and linked records deleted successfully.' });
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ success: false, message: 'Failed to delete customer', error: err.message });
    }
};
