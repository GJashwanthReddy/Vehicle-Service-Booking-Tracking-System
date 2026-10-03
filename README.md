# 🚗 Vehicle Service Booking & Tracking System

An end-to-end, database-driven **Vehicle Service Booking & Tracking System** built with **React.js**, **Node.js (Express.js)**, and **MySQL 8**. Designed for complete automotive workshop management—from customer onboarding and vehicle fleet tracking to technician allocation, automated inventory stock management via database triggers, billing with 18% GST tax calculation, and joined service history tracking.

---

## 🌟 Key Features

### 1. 👥 Customer & Fleet Management
- **Customer Onboarding**: Register customers with phone number format validation.
- **Vehicle Registration**: Register vehicles (License Plate, Brand, Model, Fuel Type, Year) linked to Customer IDs via 1-to-Many relational constraints.

### 2. 📅 Service Booking & Dynamic Catalogue
- **Dynamic Catalogue**: Fetches service offerings (`Full Periodical Service`, `Oil Change & Filter`, `Brake Inspection`, `AC Service`, etc.) from MySQL.
- **Live Status Workflow**: Tracks service progression through 5 stages (`BOOKED` ➔ `CONFIRMED` ➔ `ASSIGNED` ➔ `IN SERVICE` ➔ `COMPLETED`).

### 3. 🛠️ Admin Console & Job Cards
- **Work Order Job Cards**: Assign technicians, record customer repair instructions, and track repair work.
- **Technician Management**: Manage technicians and specialization status (`Available` / `Busy`).
- **Spare Parts Inventory**: Manage spare parts stock levels, unit pricing, and consumption.

### 4. ⚡ DBMS Advanced Features
- **Database Trigger (`trg_reduce_inventory_on_part_used`)**: Automatically decrements spare part inventory upon consumption and enforces non-negative stock constraints (`SIGNAL SQLSTATE '45000'`).
- **Database View (`vw_vehicle_service_history`)**: Joins 6 tables (`service_bookings`, `vehicles`, `customers`, `job_cards`, `technicians`, `invoices`) into a queryable audit log.
- **Stored Procedures**: Parameterized procedural routines for tax calculation and service history lookup.

### 5. 💳 Billing & GST Tax Invoicing
- **Automated Tax Invoicing**: Computes labor charge + spare parts used + **18% GST Tax**.
- **Payment Settlement**: Tracks `Pending` vs `Paid` receivables with printable tax invoice slip preview.

---

## 📐 Database Schema & Architecture

```
customers ──────────< vehicles ──────────< service_bookings ───────> service_types
                        │                       │
                        │                       ▼ (1:1)
                        └─────────────────> job_cards ─────────────> technicians
                                                │
                                    ┌───────────┴───────────┐
                                    ▼ (1:N)                 ▼ (1:1)
                                parts_used                invoices
                                    │
                                    ▼ (N:1)
                               spare_parts
```

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Lucide-React Icons, CSS3
- **Backend**: Node.js, Express.js, MySQL2 Connection Pool
- **Database**: MySQL 8 (9 Tables, 1 Trigger, 1 View, 2 Stored Procedures)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)

### 1. Database Setup
Ensure MySQL is running, then execute the setup script to create database schema and seed data:
```cmd
cd backend
node setup_mysql.js
```

### 2. Backend API Server
```cmd
cd backend
npm install
npm start
```
*Backend API runs at `http://localhost:5001/api`*

### 3. Frontend Client
```cmd
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`*

---

## 👥 Authors & Course Information
- **Course**: Database Systems Engineering & Distributed Backend Development
- **Repository**: [https://github.com/GJashwanthReddy/Vehicle-Service-Booking-Tracking-System](https://github.com/GJashwanthReddy/Vehicle-Service-Booking-Tracking-System)
