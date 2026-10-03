-- ====================================================================
-- SEED DATA FOR VEHICLE SERVICE BOOKING & TRACKING SYSTEM
-- ====================================================================

USE vehicle_service_db;

-- 1. Seed Customers
INSERT INTO customers (id, name, email, phone, address) VALUES
(1, 'G Jashwanth Reddy', 'jashwanth@example.com', '9876543210', 'Jubilee Hills, Hyderabad'),
(2, 'Mohammad Zaid Amaan', 'zaid@example.com', '9123456789', 'Banjara Hills, Hyderabad'),
(3, 'Srinivas Rao', 'srinivas@example.com', '9848022334', 'Madhapur, Hyderabad')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Seed Vehicles
INSERT INTO vehicles (id, customer_id, vehicle_number, brand, model, fuel_type, manufacture_year) VALUES
(1, 1, 'AP 09 AB 1234', 'Hyundai', 'i20 N Line', 'PETROL', 2022),
(2, 2, 'TS 09 EF 9012', 'Toyota', 'Fortuner', 'DIESEL', 2021),
(3, 3, 'TS 07 HK 5678', 'Honda', 'City i-VTEC', 'PETROL', 2020)
ON DUPLICATE KEY UPDATE vehicle_number=VALUES(vehicle_number);

-- 3. Seed Service Types Catalogue
INSERT INTO service_types (id, service_name, description, estimated_cost, estimated_duration) VALUES
(1, 'Full Periodical Service', 'Complete engine tune-up, synthetic oil change, filter replacements, and 50-point inspection', 3500.00, '4 Hours'),
(2, 'Oil Change & Filter', 'Engine oil flushing, synthetic oil replacement, and new oil filter installation', 1200.00, '1 Hour'),
(3, 'Brake Inspection & Overhaul', 'Brake pad inspection, brake fluid flush, rotor cleaning, and pad replacement if needed', 1800.00, '2 Hours'),
(4, 'AC Service & Gas Refill', 'Air conditioner filter cleaning, cooling coil check, leak test, and R134a refrigerant refill', 2200.00, '2 Hours'),
(5, 'Full Washing & Detailing', 'High-pressure foam washing, underbody cleaning, interior vacuuming, and dashboard polish', 800.00, '1 Hour'),
(6, 'General Technical Inspection', 'Comprehensive computerized engine diagnostics, suspension check, and battery health report', 500.00, '1 Hour')
ON DUPLICATE KEY UPDATE service_name=VALUES(service_name);

-- 4. Seed Technicians
INSERT INTO technicians (id, name, phone, specialization, status) VALUES
(1, 'Ramesh Kumar', '9876500001', 'Engine & Transmission Specialist', 'Available'),
(2, 'Suresh Verma', '9876500002', 'Brake & Suspension Specialist', 'Available'),
(3, 'Rajesh Sharma', '9876500003', 'Auto Electrical & AC Specialist', 'Busy'),
(4, 'Vikram Singh', '9876500004', 'General Maintenance & Detailing', 'Available')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Seed Spare Parts Inventory
INSERT INTO spare_parts (id, part_name, part_number, quantity_available, unit_price) VALUES
(1, 'Synthetic Engine Oil 4L', 'OIL-SYN-4L', 25, 1450.00),
(2, 'Oil Filter Element', 'FLT-OIL-01', 40, 350.00),
(3, 'Brake Pad Set (Front)', 'BRK-PAD-FT', 15, 1200.00),
(4, 'Cabin AC Filter', 'AC-FLT-CAB', 20, 450.00),
(5, 'Spark Plug Set (4 Pcs)', 'SPK-PLG-04', 30, 800.00),
(6, 'Engine Coolant 1L', 'CLN-ENG-1L', 50, 250.00)
ON DUPLICATE KEY UPDATE part_name=VALUES(part_name);

-- 6. Seed Service Bookings
INSERT INTO service_bookings (id, customer_id, vehicle_id, service_type, booking_date, preferred_slot, status, notes) VALUES
(1, 1, 1, 'Full Periodical Service', '2026-10-05', 'Morning (9 AM - 12 PM)', 'COMPLETED', 'Regular 20,000 km maintenance service'),
(2, 2, 2, 'Oil Change & Filter', '2026-10-06', 'Afternoon (2 PM - 5 PM)', 'IN_PROGRESS', 'Synthetic oil requested with filter change'),
(3, 3, 3, 'Brake Inspection & Overhaul', '2026-10-07', 'Morning (9 AM - 12 PM)', 'PENDING', 'Slight noise during sudden braking')
ON DUPLICATE KEY UPDATE service_type=VALUES(service_type);

-- 7. Seed Job Cards
INSERT INTO job_cards (id, booking_id, vehicle_id, customer_id, technician_id, problem_description, work_description, start_time, completion_time, status) VALUES
(1, 1, 1, 1, 1, 'Periodic service required', 'Completed full engine oil change, filter replacement, and tire rotation', '2026-10-05 09:30:00', '2026-10-05 13:30:00', 'Completed'),
(2, 2, 2, 2, 2, 'Engine oil change and general inspection', 'Replaced engine oil and clean air filter. Suspension check underway', '2026-10-06 14:00:00', NULL, 'In Service')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 8. Seed Parts Used (Will trigger stock deduction if executed directly)
INSERT INTO parts_used (id, job_card_id, part_id, quantity_used, unit_price) VALUES
(1, 1, 1, 1, 1450.00),
(2, 1, 2, 1, 350.00)
ON DUPLICATE KEY UPDATE quantity_used=VALUES(quantity_used);

-- 9. Seed Invoices
INSERT INTO invoices (id, job_card_id, customer_id, vehicle_id, service_charges, parts_charges, tax_amount, total_amount, payment_status, invoice_date) VALUES
(1, 1, 1, 1, 3500.00, 1800.00, 954.00, 6254.00, 'Paid', '2026-10-05')
ON DUPLICATE KEY UPDATE payment_status=VALUES(payment_status);
