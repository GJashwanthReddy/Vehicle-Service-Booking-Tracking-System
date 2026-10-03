-- ====================================================================
-- FINAL PROJECT EXPO: VEHICLE SERVICE BOOKING & TRACKING SYSTEM
-- Database Schema Definition for MySQL 8 (vehicle_service_db)
-- Course: Database Systems Engineering & Distributed Backend Development
-- Team Members: 
--   1. 2520030426 - G Jashwanth Reddy
--   2. 2520030382 - Mohammad Zaid Amaan
-- Tech Stack: React.js + Node.js (Express) + MySQL 8 (mysql2 connection pool)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS vehicle_service_db;
USE vehicle_service_db;

-- Drop existing views & tables in reverse dependency order for clean setup
DROP VIEW IF EXISTS vw_vehicle_service_history;
DROP TRIGGER IF EXISTS trg_reduce_inventory_on_part_used;
DROP PROCEDURE IF EXISTS sp_get_vehicle_history;
DROP PROCEDURE IF EXISTS sp_generate_invoice;

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS parts_used;
DROP TABLE IF EXISTS spare_parts;
DROP TABLE IF EXISTS job_cards;
DROP TABLE IF EXISTS technicians;
DROP TABLE IF EXISTS service_bookings;
DROP TABLE IF EXISTS service_types;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS customers;

-- --------------------------------------------------------------------
-- 1. Customers Table
-- --------------------------------------------------------------------
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 2. Vehicles Table (Foreign Key -> customers.id)
-- --------------------------------------------------------------------
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_number VARCHAR(30) NOT NULL UNIQUE,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(20) DEFAULT 'PETROL',
    manufacture_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- 3. Service Types Catalogue Table
-- --------------------------------------------------------------------
CREATE TABLE service_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    estimated_cost DECIMAL(10, 2) NOT NULL,
    estimated_duration VARCHAR(50) DEFAULT '2 Hours',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 4. Service Bookings Table
-- --------------------------------------------------------------------
CREATE TABLE service_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    preferred_slot VARCHAR(50) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- 5. Technicians Table
-- --------------------------------------------------------------------
CREATE TABLE technicians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    status ENUM('Available', 'Busy', 'On Leave') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 6. Job Cards Table (1:1 with booking, maps to technician)
-- --------------------------------------------------------------------
CREATE TABLE job_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    vehicle_id INT NOT NULL,
    customer_id INT NOT NULL,
    technician_id INT NULL,
    problem_description TEXT,
    work_description TEXT,
    start_time DATETIME NULL,
    completion_time DATETIME NULL,
    status ENUM('Open', 'Assigned', 'In Service', 'Completed', 'Cancelled') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE SET NULL
);

-- --------------------------------------------------------------------
-- 7. Spare Parts Inventory Table
-- --------------------------------------------------------------------
CREATE TABLE spare_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_name VARCHAR(100) NOT NULL,
    part_number VARCHAR(50) NOT NULL UNIQUE,
    quantity_available INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 8. Parts Used Junction Table (N:M Job Cards <-> Spare Parts)
-- --------------------------------------------------------------------
CREATE TABLE parts_used (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_card_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity_used INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES spare_parts(id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- 9. Invoices Table (1:1 with Job Card)
-- --------------------------------------------------------------------
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_card_id INT NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    service_charges DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    parts_charges DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('Pending', 'Paid') DEFAULT 'Pending',
    invoice_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- ====================================================================
-- DBMS ADVANCED FEATURES: TRIGGERS, VIEWS, & STORED PROCEDURES
-- ====================================================================

-- 1. TRIGGER: Automatically reduce inventory stock when spare part is recorded as used
DELIMITER //
CREATE TRIGGER trg_reduce_inventory_on_part_used
BEFORE INSERT ON parts_used
FOR EACH ROW
BEGIN
    DECLARE available_stock INT;
    
    -- Fetch current quantity available
    SELECT quantity_available INTO available_stock 
    FROM spare_parts 
    WHERE id = NEW.part_id;
    
    -- Check if sufficient stock is available
    IF available_stock < NEW.quantity_used THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Insufficient spare part stock! Stock cannot become negative.';
    ELSE
        -- Update inventory quantity
        UPDATE spare_parts 
        SET quantity_available = quantity_available - NEW.quantity_used 
        WHERE id = NEW.part_id;
    END IF;
END;
//
DELIMITER ;

-- 2. VIEW: Complete Vehicle Service History View joining all core entities
CREATE OR REPLACE VIEW vw_vehicle_service_history AS
SELECT 
    COALESCE(j.id, 0) AS job_card_id,
    b.id AS booking_id,
    v.id AS vehicle_id,
    v.vehicle_number,
    v.brand,
    v.model,
    c.id AS customer_id,
    c.name AS customer_name,
    c.phone AS customer_phone,
    b.service_type,
    b.booking_date,
    COALESCE(j.status, b.status) AS job_status,
    COALESCE(t.name, 'Unassigned') AS technician_name,
    COALESCE(j.work_description, b.notes, 'Service Appointment') AS work_description,
    COALESCE(i.total_amount, 0.00) AS invoice_amount,
    COALESCE(i.payment_status, 'Pending') AS payment_status,
    b.created_at
FROM service_bookings b
JOIN vehicles v ON b.vehicle_id = v.id
JOIN customers c ON b.customer_id = c.id
LEFT JOIN job_cards j ON b.id = j.booking_id
LEFT JOIN technicians t ON j.technician_id = t.id
LEFT JOIN invoices i ON j.id = i.job_card_id;

-- 3. STORED PROCEDURE: Fetch Service History for a selected vehicle
DELIMITER //
CREATE PROCEDURE sp_get_vehicle_history(IN in_vehicle_id INT)
BEGIN
    SELECT * FROM vw_vehicle_service_history
    WHERE vehicle_id = in_vehicle_id
    ORDER BY created_at DESC;
END;
//
DELIMITER ;

-- 4. STORED PROCEDURE: Generate Invoice for Completed Job Card
DELIMITER //
CREATE PROCEDURE sp_generate_invoice(IN in_job_card_id INT)
BEGIN
    DECLARE v_customer_id INT;
    DECLARE v_vehicle_id INT;
    DECLARE v_service_cost DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_parts_cost DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_tax DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_total DECIMAL(10, 2) DEFAULT 0.00;
    
    -- Fetch customer & vehicle details from job card & booking
    SELECT j.customer_id, j.vehicle_id, st.estimated_cost
    INTO v_customer_id, v_vehicle_id, v_service_cost
    FROM job_cards j
    JOIN service_bookings b ON j.booking_id = b.id
    LEFT JOIN service_types st ON b.service_type = st.service_name
    WHERE j.id = in_job_card_id;
    
    -- Calculate total parts cost used for this job card
    SELECT COALESCE(SUM(quantity_used * unit_price), 0.00) INTO v_parts_cost
    FROM parts_used
    WHERE job_card_id = in_job_card_id;
    
    -- Apply 18% GST tax
    SET v_tax = (v_service_cost + v_parts_cost) * 0.18;
    SET v_total = v_service_cost + v_parts_cost + v_tax;
    
    -- Insert or update invoice
    INSERT INTO invoices (job_card_id, customer_id, vehicle_id, service_charges, parts_charges, tax_amount, total_amount, payment_status, invoice_date)
    VALUES (in_job_card_id, v_customer_id, v_vehicle_id, v_service_cost, v_parts_cost, v_tax, v_total, 'Pending', CURDATE())
    ON DUPLICATE KEY UPDATE
        service_charges = v_service_cost,
        parts_charges = v_parts_cost,
        tax_amount = v_tax,
        total_amount = v_total;
        
    SELECT * FROM invoices WHERE job_card_id = in_job_card_id;
END;
//
DELIMITER ;
