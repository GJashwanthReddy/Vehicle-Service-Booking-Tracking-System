const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: 'vehicle_service_db'
};

async function seedAllTables() {
    let pool;
    try {
        console.log('🔄 Connecting to vehicle_service_db...');
        pool = mysql.createPool(dbConfig);

        console.log('1. Inserting Customers...');
        await pool.query(`
            INSERT INTO customers (id, name, email, phone, address) VALUES
            (1, 'G Jashwanth Reddy', 'jashwanth@example.com', '9876543210', 'Jubilee Hills, Hyderabad'),
            (2, 'Mohammad Zaid Amaan', 'zaid@example.com', '9123456789', 'Banjara Hills, Hyderabad'),
            (3, 'Srinivas Rao', 'srinivas@example.com', '9848022334', 'Madhapur, Hyderabad')
            ON DUPLICATE KEY UPDATE name=VALUES(name);
        `);

        console.log('2. Inserting Vehicles...');
        await pool.query(`
            INSERT INTO vehicles (id, customer_id, vehicle_number, brand, model, fuel_type, manufacture_year) VALUES
            (1, 1, 'AP 09 AB 1234', 'Hyundai', 'i20 N Line', 'PETROL', 2022),
            (2, 2, 'TS 09 EF 9012', 'Toyota', 'Fortuner', 'DIESEL', 2021),
            (3, 3, 'TS 07 HK 5678', 'Honda', 'City i-VTEC', 'PETROL', 2020)
            ON DUPLICATE KEY UPDATE vehicle_number=VALUES(vehicle_number);
        `);

        console.log('3. Inserting Service Types...');
        await pool.query(`
            INSERT INTO service_types (id, service_name, description, estimated_cost, estimated_duration) VALUES
            (1, 'Full Periodical Service', 'Complete engine tune-up, synthetic oil change, filter replacements, and 50-point inspection', 3500.00, '4 Hours'),
            (2, 'Oil Change & Filter', 'Engine oil flushing, synthetic oil replacement, and new oil filter installation', 1200.00, '1 Hour'),
            (3, 'Brake Inspection & Overhaul', 'Brake pad inspection, brake fluid flush, rotor cleaning, and pad replacement if needed', 1800.00, '2 Hours'),
            (4, 'AC Service & Gas Refill', 'Air conditioner filter cleaning, cooling coil check, leak test, and R134a refrigerant refill', 2200.00, '2 Hours'),
            (5, 'Full Washing & Detailing', 'High-pressure foam washing, underbody cleaning, interior vacuuming, and dashboard polish', 800.00, '1 Hour'),
            (6, 'General Technical Inspection', 'Comprehensive computerized engine diagnostics, suspension check, and battery health report', 500.00, '1 Hour')
            ON DUPLICATE KEY UPDATE description=VALUES(description);
        `);

        console.log('4. Inserting Service Bookings...');
        await pool.query(`
            INSERT INTO service_bookings (id, customer_id, vehicle_id, service_type, booking_date, preferred_slot, status, notes) VALUES
            (1, 1, 1, 'Full Periodical Service', '2026-10-05', 'Morning (9 AM - 12 PM)', 'COMPLETED', 'Regular 20,000 km maintenance service'),
            (2, 2, 2, 'Oil Change & Filter', '2026-10-06', 'Afternoon (2 PM - 5 PM)', 'IN_PROGRESS', 'Synthetic oil requested with filter change'),
            (3, 3, 3, 'Brake Inspection & Overhaul', '2026-10-07', 'Morning (9 AM - 12 PM)', 'PENDING', 'Slight noise during sudden braking')
            ON DUPLICATE KEY UPDATE status=VALUES(status);
        `);

        console.log('5. Inserting Technicians...');
        await pool.query(`
            INSERT INTO technicians (id, name, phone, specialization, status) VALUES
            (1, 'Ramesh Kumar', '9876500001', 'Engine & Transmission Specialist', 'Available'),
            (2, 'Suresh Verma', '9876500002', 'Brake & Suspension Specialist', 'Available'),
            (3, 'Rajesh Sharma', '9876500003', 'Auto Electrical & AC Specialist', 'Busy'),
            (4, 'Vikram Singh', '9876500004', 'General Maintenance & Detailing', 'Available')
            ON DUPLICATE KEY UPDATE name=VALUES(name);
        `);

        console.log('6. Inserting Spare Parts...');
        await pool.query(`
            INSERT INTO spare_parts (id, part_name, part_number, quantity_available, unit_price) VALUES
            (1, 'Synthetic Engine Oil 4L', 'OIL-SYN-4L', 25, 1450.00),
            (2, 'Oil Filter Element', 'FLT-OIL-01', 40, 350.00),
            (3, 'Brake Pad Set (Front)', 'BRK-PAD-FT', 15, 1200.00),
            (4, 'Cabin AC Filter', 'AC-FLT-CAB', 20, 450.00),
            (5, 'Spark Plug Set (4 Pcs)', 'SPK-PLG-04', 30, 800.00),
            (6, 'Engine Coolant 1L', 'CLN-ENG-1L', 50, 250.00)
            ON DUPLICATE KEY UPDATE quantity_available=VALUES(quantity_available);
        `);

        console.log('7. Inserting Job Cards...');
        await pool.query(`
            INSERT INTO job_cards (id, booking_id, vehicle_id, customer_id, technician_id, problem_description, work_description, start_time, completion_time, status) VALUES
            (1, 1, 1, 1, 1, 'Periodic service required', 'Completed full engine oil change, filter replacement, and tire rotation', '2026-10-05 09:30:00', '2026-10-05 13:30:00', 'Completed'),
            (2, 2, 2, 2, 2, 'Engine oil change and general inspection', 'Replaced engine oil and clean air filter. Suspension check underway', '2026-10-06 14:00:00', NULL, 'In Service')
            ON DUPLICATE KEY UPDATE status=VALUES(status);
        `);

        console.log('8. Inserting Parts Used...');
        await pool.query(`
            INSERT INTO parts_used (id, job_card_id, part_id, quantity_used, unit_price) VALUES
            (1, 1, 1, 1, 1450.00),
            (2, 1, 2, 1, 350.00)
            ON DUPLICATE KEY UPDATE quantity_used=VALUES(quantity_used);
        `);

        console.log('9. Inserting Invoices...');
        await pool.query(`
            INSERT INTO invoices (id, job_card_id, customer_id, vehicle_id, service_charges, parts_charges, tax_amount, total_amount, payment_status, invoice_date) VALUES
            (1, 1, 1, 1, 3500.00, 1800.00, 954.00, 6254.00, 'Paid', '2026-10-05')
            ON DUPLICATE KEY UPDATE payment_status=VALUES(payment_status);
        `);

        console.log('🎉 ALL 9 TABLES POPULATED IN MYSQL SUCCESSFULLY!');

        const [invRows] = await pool.query('SELECT * FROM invoices;');
        console.log('📊 Total Invoices in MySQL:', invRows.length);
        console.log(invRows);
    } catch (err) {
        console.error('❌ Seeding Error:', err);
    } finally {
        if (pool) await pool.end();
        process.exit(0);
    }
}

seedAllTables();
