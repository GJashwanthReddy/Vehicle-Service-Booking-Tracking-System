const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'vehicle_service_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// In-Memory Data Store Fallback for seamlessly running without active MySQL daemon
const mockStore = {
    customers: [
        { id: 1, name: 'G Jashwanth Reddy', email: 'jashwanth@example.com', phone: '9876543210', address: 'Jubilee Hills, Hyderabad', created_at: new Date('2026-09-01') },
        { id: 2, name: 'Mohammad Zaid Amaan', email: 'zaid@example.com', phone: '9123456789', address: 'Banjara Hills, Hyderabad', created_at: new Date('2026-09-02') },
        { id: 3, name: 'Srinivas Rao', email: 'srinivas@example.com', phone: '9848022334', address: 'Madhapur, Hyderabad', created_at: new Date('2026-09-05') }
    ],
    vehicles: [
        { id: 1, customer_id: 1, vehicle_number: 'AP 09 AB 1234', brand: 'Hyundai', model: 'i20 N Line', fuel_type: 'PETROL', manufacture_year: 2022, created_at: new Date('2026-09-01') },
        { id: 2, customer_id: 2, vehicle_number: 'TS 09 EF 9012', brand: 'Toyota', model: 'Fortuner', fuel_type: 'DIESEL', manufacture_year: 2021, created_at: new Date('2026-09-02') },
        { id: 3, customer_id: 3, vehicle_number: 'TS 07 HK 5678', brand: 'Honda', model: 'City i-VTEC', fuel_type: 'PETROL', manufacture_year: 2020, created_at: new Date('2026-09-05') }
    ],
    service_types: [
        { id: 1, service_name: 'Full Periodical Service', description: 'Complete engine tune-up, synthetic oil change, filter replacements, and 50-point inspection', estimated_cost: 3500.00, estimated_duration: '4 Hours' },
        { id: 2, service_name: 'Oil Change & Filter', description: 'Engine oil flushing, synthetic oil replacement, and new oil filter installation', estimated_cost: 1200.00, estimated_duration: '1 Hour' },
        { id: 3, service_name: 'Brake Inspection & Overhaul', description: 'Brake pad inspection, brake fluid flush, rotor cleaning, and pad replacement if needed', estimated_cost: 1800.00, estimated_duration: '2 Hours' },
        { id: 4, service_name: 'AC Service & Gas Refill', description: 'Air conditioner filter cleaning, cooling coil check, leak test, and R134a refrigerant refill', estimated_cost: 2200.00, estimated_duration: '2 Hours' },
        { id: 5, service_name: 'Full Washing & Detailing', description: 'High-pressure foam washing, underbody cleaning, interior vacuuming, and dashboard polish', estimated_cost: 800.00, estimated_duration: '1 Hour' },
        { id: 6, service_name: 'General Technical Inspection', description: 'Comprehensive computerized engine diagnostics, suspension check, and battery health report', estimated_cost: 500.00, estimated_duration: '1 Hour' }
    ],
    bookings: [
        { id: 1, customer_id: 1, vehicle_id: 1, service_type: 'Full Periodical Service', booking_date: '2026-10-05', preferred_slot: 'Morning (9 AM - 12 PM)', status: 'COMPLETED', notes: 'Regular 20,000 km maintenance service', created_at: new Date('2026-09-10') },
        { id: 2, customer_id: 2, vehicle_id: 2, service_type: 'Oil Change & Filter', booking_date: '2026-10-06', preferred_slot: 'Afternoon (2 PM - 5 PM)', status: 'IN_PROGRESS', notes: 'Synthetic oil requested with filter change', created_at: new Date('2026-09-12') },
        { id: 3, customer_id: 3, vehicle_id: 3, service_type: 'Brake Inspection & Overhaul', booking_date: '2026-10-07', preferred_slot: 'Morning (9 AM - 12 PM)', status: 'PENDING', notes: 'Slight noise during sudden braking', created_at: new Date('2026-09-14') }
    ],
    technicians: [
        { id: 1, name: 'Ramesh Kumar', phone: '9876500001', specialization: 'Engine & Transmission Specialist', status: 'Available', created_at: new Date() },
        { id: 2, name: 'Suresh Verma', phone: '9876500002', specialization: 'Brake & Suspension Specialist', status: 'Available', created_at: new Date() },
        { id: 3, name: 'Rajesh Sharma', phone: '9876500003', specialization: 'Auto Electrical & AC Specialist', status: 'Busy', created_at: new Date() },
        { id: 4, name: 'Vikram Singh', phone: '9876500004', specialization: 'General Maintenance & Detailing', status: 'Available', created_at: new Date() }
    ],
    job_cards: [
        { id: 1, booking_id: 1, vehicle_id: 1, customer_id: 1, technician_id: 1, problem_description: 'Periodic service required', work_description: 'Completed full engine oil change, filter replacement, and tire rotation', start_time: '2026-10-05 09:30:00', completion_time: '2026-10-05 13:30:00', status: 'Completed', created_at: new Date('2026-10-05') },
        { id: 2, booking_id: 2, vehicle_id: 2, customer_id: 2, technician_id: 2, problem_description: 'Engine oil change and general inspection', work_description: 'Replaced engine oil and clean air filter. Suspension check underway', start_time: '2026-10-06 14:00:00', completion_time: null, status: 'In Service', created_at: new Date('2026-10-06') }
    ],
    spare_parts: [
        { id: 1, part_name: 'Synthetic Engine Oil 4L', part_number: 'OIL-SYN-4L', quantity_available: 24, unit_price: 1450.00, created_at: new Date() },
        { id: 2, part_name: 'Oil Filter Element', part_number: 'FLT-OIL-01', quantity_available: 39, unit_price: 350.00, created_at: new Date() },
        { id: 3, part_name: 'Brake Pad Set (Front)', part_number: 'BRK-PAD-FT', quantity_available: 15, unit_price: 1200.00, created_at: new Date() },
        { id: 4, part_name: 'Cabin AC Filter', part_number: 'AC-FLT-CAB', quantity_available: 20, unit_price: 450.00, created_at: new Date() },
        { id: 5, part_name: 'Spark Plug Set (4 Pcs)', part_number: 'SPK-PLG-04', quantity_available: 30, unit_price: 800.00, created_at: new Date() },
        { id: 6, part_name: 'Engine Coolant 1L', part_number: 'CLN-ENG-1L', quantity_available: 50, unit_price: 250.00, created_at: new Date() }
    ],
    parts_used: [
        { id: 1, job_card_id: 1, part_id: 1, quantity_used: 1, unit_price: 1450.00, created_at: new Date('2026-10-05') },
        { id: 2, job_card_id: 1, part_id: 2, quantity_used: 1, unit_price: 350.00, created_at: new Date('2026-10-05') }
    ],
    invoices: [
        { id: 1, job_card_id: 1, customer_id: 1, vehicle_id: 1, service_charges: 3500.00, parts_charges: 1800.00, tax_amount: 954.00, total_amount: 6254.00, payment_status: 'Paid', invoice_date: '2026-10-05', created_at: new Date('2026-10-05') }
    ]
};

let pool = null;
let isRealMySQLConnected = false;

async function initDB() {
    try {
        pool = mysql.createPool(dbConfig);
        const conn = await pool.getConnection();
        conn.release();
        isRealMySQLConnected = true;
        console.log('✅ Connected to MySQL Database:', dbConfig.database);
    } catch (err) {
        isRealMySQLConnected = false;
        console.warn('⚠️  MySQL Server connection failed:', err.message);
        console.warn('💡 Operating in Fallback Mode with In-Memory Data Store.');
    }
}

initDB();

// Dynamic Query Wrapper supporting real MySQL & Fallback execution
async function query(sql, params = []) {
    if (isRealMySQLConnected && pool) {
        const [results] = await pool.query(sql, params);
        return results;
    }

    // --- Mock Fallback Logic for offline/standalone execution ---
    const lowerSql = sql.trim().toLowerCase();

    // CUSTOMERS
    if (lowerSql.includes('from customers') && lowerSql.includes('where id =')) {
        return mockStore.customers.filter(c => c.id == params[0]);
    }
    if (lowerSql.includes('from customers') && lowerSql.includes('where email =')) {
        return mockStore.customers.filter(c => c.email == params[0]);
    }
    if (lowerSql.includes('from customers')) {
        return [...mockStore.customers];
    }
    if (lowerSql.includes('insert into customers')) {
        const newId = mockStore.customers.length ? Math.max(...mockStore.customers.map(c => c.id)) + 1 : 1;
        const newCustomer = { id: newId, name: params[0], email: params[1], phone: params[2], address: params[3], created_at: new Date() };
        mockStore.customers.push(newCustomer);
        return { insertId: newId, affectedRows: 1 };
    }
    if (lowerSql.includes('delete from customers')) {
        mockStore.customers = mockStore.customers.filter(c => c.id != params[0]);
        return { affectedRows: 1 };
    }

    // VEHICLES
    if (lowerSql.includes('from vehicles') && lowerSql.includes('where vehicle_number =')) {
        return mockStore.vehicles.filter(v => v.vehicle_number.toUpperCase() === String(params[0]).toUpperCase());
    }
    if (lowerSql.includes('from vehicles') && lowerSql.includes('where customer_id =')) {
        const vList = mockStore.vehicles.filter(v => v.customer_id == params[0]);
        return vList.map(v => {
            const cust = mockStore.customers.find(c => c.id == v.customer_id);
            return { ...v, customer_name: cust ? cust.name : 'Unknown' };
        });
    }
    if (lowerSql.includes('from vehicles') && lowerSql.includes('where id =')) {
        return mockStore.vehicles.filter(v => v.id == params[0]);
    }
    if (lowerSql.includes('from vehicles')) {
        return mockStore.vehicles.map(v => {
            const cust = mockStore.customers.find(c => c.id == v.customer_id);
            return { ...v, customer_name: cust ? cust.name : 'Unknown', customer_phone: cust ? cust.phone : '' };
        });
    }
    if (lowerSql.includes('insert into vehicles')) {
        const newId = mockStore.vehicles.length ? Math.max(...mockStore.vehicles.map(v => v.id)) + 1 : 1;
        const newVeh = { id: newId, customer_id: params[0], vehicle_number: params[1], brand: params[2], model: params[3], fuel_type: params[4] || 'PETROL', manufacture_year: params[5] || 2023, created_at: new Date() };
        mockStore.vehicles.push(newVeh);
        return { insertId: newId, affectedRows: 1 };
    }
    if (lowerSql.includes('delete from vehicles')) {
        mockStore.vehicles = mockStore.vehicles.filter(v => v.id != params[0]);
        return { affectedRows: 1 };
    }

    // SERVICE TYPES
    if (lowerSql.includes('from service_types') && lowerSql.includes('where id =')) {
        return mockStore.service_types.filter(s => s.id == params[0]);
    }
    if (lowerSql.includes('from service_types')) {
        return [...mockStore.service_types];
    }
    if (lowerSql.includes('insert into service_types')) {
        const newId = mockStore.service_types.length ? Math.max(...mockStore.service_types.map(s => s.id)) + 1 : 1;
        const newSt = { id: newId, service_name: params[0], description: params[1], estimated_cost: parseFloat(params[2]), estimated_duration: params[3] || '2 Hours', created_at: new Date() };
        mockStore.service_types.push(newSt);
        return { insertId: newId, affectedRows: 1 };
    }

    // SERVICE BOOKINGS
    if (lowerSql.includes('from service_bookings') && lowerSql.includes('where id =')) {
        const b = mockStore.bookings.find(item => item.id == params[0]);
        if (!b) return [];
        const cust = mockStore.customers.find(c => c.id == b.customer_id);
        const veh = mockStore.vehicles.find(v => v.id == b.vehicle_id);
        return [{ ...b, customer_name: cust ? cust.name : 'Unknown', customer_phone: cust ? cust.phone : 'N/A', vehicle_number: veh ? veh.vehicle_number : 'N/A', brand: veh ? veh.brand : '', model: veh ? veh.model : '', vehicle_details: veh ? `${veh.brand} ${veh.model}` : '' }];
    }
    if (lowerSql.includes('from service_bookings')) {
        return mockStore.bookings.map(b => {
            const cust = mockStore.customers.find(c => c.id == b.customer_id);
            const veh = mockStore.vehicles.find(v => v.id == b.vehicle_id);
            return { ...b, customer_name: cust ? cust.name : 'Unknown', customer_phone: cust ? cust.phone : 'N/A', customer_email: cust ? cust.email : '', vehicle_number: veh ? veh.vehicle_number : 'N/A', brand: veh ? veh.brand : '', model: veh ? veh.model : '', vehicle_details: veh ? `${veh.brand} ${veh.model}` : '' };
        });
    }
    if (lowerSql.includes('insert into service_bookings')) {
        const newId = mockStore.bookings.length ? Math.max(...mockStore.bookings.map(b => b.id)) + 1 : 1;
        const newB = { id: newId, customer_id: params[0], vehicle_id: params[1], service_type: params[2], booking_date: params[3], preferred_slot: params[4], status: params[5] || 'PENDING', notes: params[6] || '', created_at: new Date() };
        mockStore.bookings.push(newB);
        return { insertId: newId, affectedRows: 1 };
    }
    if (lowerSql.includes('update service_bookings set status =')) {
        const b = mockStore.bookings.find(item => item.id == params[1]);
        if (b) { b.status = params[0]; return { affectedRows: 1 }; }
        return { affectedRows: 0 };
    }

    // TECHNICIANS
    if (lowerSql.includes('from technicians') && lowerSql.includes('where id =')) {
        return mockStore.technicians.filter(t => t.id == params[0]);
    }
    if (lowerSql.includes('from technicians')) {
        return [...mockStore.technicians];
    }
    if (lowerSql.includes('insert into technicians')) {
        const newId = mockStore.technicians.length ? Math.max(...mockStore.technicians.map(t => t.id)) + 1 : 1;
        const newTech = { id: newId, name: params[0], phone: params[1], specialization: params[2], status: params[3] || 'Available', created_at: new Date() };
        mockStore.technicians.push(newTech);
        return { insertId: newId, affectedRows: 1 };
    }
    if (lowerSql.includes('update technicians set status =')) {
        const t = mockStore.technicians.find(item => item.id == params[1]);
        if (t) { t.status = params[0]; return { affectedRows: 1 }; }
        return { affectedRows: 0 };
    }

    // JOB CARDS
    if (lowerSql.includes('from job_cards') && lowerSql.includes('where id =')) {
        const j = mockStore.job_cards.find(item => item.id == params[0]);
        if (!j) return [];
        const cust = mockStore.customers.find(c => c.id == j.customer_id);
        const veh = mockStore.vehicles.find(v => v.id == j.vehicle_id);
        const tech = mockStore.technicians.find(t => t.id == j.technician_id);
        const book = mockStore.bookings.find(b => b.id == j.booking_id);
        return [{ ...j, customer_name: cust ? cust.name : '', vehicle_number: veh ? veh.vehicle_number : '', brand: veh ? veh.brand : '', model: veh ? veh.model : '', technician_name: tech ? tech.name : 'Unassigned', service_type: book ? book.service_type : '' }];
    }
    if (lowerSql.includes('from job_cards') && lowerSql.includes('where booking_id =')) {
        const list = mockStore.job_cards.filter(item => item.booking_id == params[0]);
        return list.map(j => {
            const cust = mockStore.customers.find(c => c.id == j.customer_id);
            const veh = mockStore.vehicles.find(v => v.id == j.vehicle_id);
            const tech = mockStore.technicians.find(t => t.id == j.technician_id);
            const book = mockStore.bookings.find(b => b.id == j.booking_id);
            return { ...j, customer_name: cust ? cust.name : '', vehicle_number: veh ? veh.vehicle_number : '', brand: veh ? veh.brand : '', model: veh ? veh.model : '', technician_name: tech ? tech.name : 'Unassigned', service_type: book ? book.service_type : '' };
        });
    }
    if (lowerSql.includes('from job_cards')) {
        return mockStore.job_cards.map(j => {
            const cust = mockStore.customers.find(c => c.id == j.customer_id);
            const veh = mockStore.vehicles.find(v => v.id == j.vehicle_id);
            const tech = mockStore.technicians.find(t => t.id == j.technician_id);
            const book = mockStore.bookings.find(b => b.id == j.booking_id);
            return { ...j, customer_name: cust ? cust.name : '', vehicle_number: veh ? veh.vehicle_number : '', brand: veh ? veh.brand : '', model: veh ? veh.model : '', technician_name: tech ? tech.name : 'Unassigned', service_type: book ? book.service_type : '' };
        });
    }
    if (lowerSql.includes('insert into job_cards')) {
        const newId = mockStore.job_cards.length ? Math.max(...mockStore.job_cards.map(j => j.id)) + 1 : 1;
        const newJ = { id: newId, booking_id: params[0], vehicle_id: params[1], customer_id: params[2], technician_id: params[3] || null, problem_description: params[4] || '', work_description: params[5] || '', start_time: params[6] || new Date(), completion_time: null, status: params[7] || 'Open', created_at: new Date() };
        mockStore.job_cards.push(newJ);
        return { insertId: newId, affectedRows: 1 };
    }
    if (lowerSql.includes('update job_cards set status =')) {
        const j = mockStore.job_cards.find(item => item.id == params[1]);
        if (j) { j.status = params[0]; return { affectedRows: 1 }; }
        return { affectedRows: 0 };
    }

    // SPARE PARTS
    if (lowerSql.includes('from spare_parts') && lowerSql.includes('where id =')) {
        return mockStore.spare_parts.filter(sp => sp.id == params[0]);
    }
    if (lowerSql.includes('from spare_parts')) {
        return [...mockStore.spare_parts];
    }
    if (lowerSql.includes('insert into spare_parts')) {
        const newId = mockStore.spare_parts.length ? Math.max(...mockStore.spare_parts.map(sp => sp.id)) + 1 : 1;
        const newSp = { id: newId, part_name: params[0], part_number: params[1], quantity_available: parseInt(params[2]), unit_price: parseFloat(params[3]), created_at: new Date() };
        mockStore.spare_parts.push(newSp);
        return { insertId: newId, affectedRows: 1 };
    }
    if (lowerSql.includes('update spare_parts set quantity_available =')) {
        const sp = mockStore.spare_parts.find(item => item.id == params[1]);
        if (sp) { sp.quantity_available = parseInt(params[0]); return { affectedRows: 1 }; }
        return { affectedRows: 0 };
    }

    // PARTS USED
    if (lowerSql.includes('from parts_used') && lowerSql.includes('where job_card_id =')) {
        const puList = mockStore.parts_used.filter(pu => pu.job_card_id == params[0]);
        return puList.map(pu => {
            const part = mockStore.spare_parts.find(sp => sp.id == pu.part_id);
            return { ...pu, part_name: part ? part.part_name : '', part_number: part ? part.part_number : '' };
        });
    }
    if (lowerSql.includes('insert into parts_used')) {
        const partId = params[1];
        const qtyUsed = parseInt(params[2]);
        const part = mockStore.spare_parts.find(sp => sp.id == partId);
        if (part) {
            if (part.quantity_available < qtyUsed) {
                throw new Error('Insufficient spare part stock! Stock cannot become negative.');
            }
            part.quantity_available -= qtyUsed; // Auto-deduct stock!
        }
        const newId = mockStore.parts_used.length ? Math.max(...mockStore.parts_used.map(pu => pu.id)) + 1 : 1;
        const newPu = { id: newId, job_card_id: params[0], part_id: partId, quantity_used: qtyUsed, unit_price: parseFloat(params[3]), created_at: new Date() };
        mockStore.parts_used.push(newPu);
        return { insertId: newId, affectedRows: 1 };
    }

    // INVOICES
    if (lowerSql.includes('from invoices') && lowerSql.includes('where job_card_id =')) {
        return mockStore.invoices.filter(inv => inv.job_card_id == params[0]);
    }
    if (lowerSql.includes('from invoices')) {
        return mockStore.invoices.map(inv => {
            const cust = mockStore.customers.find(c => c.id == inv.customer_id);
            const veh = mockStore.vehicles.find(v => v.id == inv.vehicle_id);
            return { ...inv, customer_name: cust ? cust.name : '', vehicle_number: veh ? veh.vehicle_number : '', brand: veh ? veh.brand : '', model: veh ? veh.model : '' };
        });
    }
    if (lowerSql.includes('insert into invoices')) {
        const newId = mockStore.invoices.length ? Math.max(...mockStore.invoices.map(inv => inv.id)) + 1 : 1;
        const newInv = { id: newId, job_card_id: params[0], customer_id: params[1], vehicle_id: params[2], service_charges: parseFloat(params[3]), parts_charges: parseFloat(params[4]), tax_amount: parseFloat(params[5]), total_amount: parseFloat(params[6]), payment_status: params[7] || 'Pending', invoice_date: params[8] || new Date().toISOString().split('T')[0], created_at: new Date() };
        mockStore.invoices.push(newInv);
        return { insertId: newId, affectedRows: 1 };
    }
    if (lowerSql.includes('update invoices set payment_status =')) {
        const inv = mockStore.invoices.find(item => item.id == params[1]);
        if (inv) { inv.payment_status = params[0]; return { affectedRows: 1 }; }
        return { affectedRows: 0 };
    }

    // SERVICE HISTORY (VIEW / PROCEDURE QUERY FALLBACK)
    if (lowerSql.includes('vw_vehicle_service_history') || lowerSql.includes('sp_get_vehicle_history')) {
        let history = [];

        // Build history records from job cards
        mockStore.job_cards.forEach(j => {
            const b = mockStore.bookings.find(item => item.id == j.booking_id);
            const v = mockStore.vehicles.find(item => item.id == j.vehicle_id);
            const c = mockStore.customers.find(item => item.id == j.customer_id);
            const t = mockStore.technicians.find(item => item.id == j.technician_id);
            const inv = mockStore.invoices.find(item => item.job_card_id == j.id);
            history.push({
                job_card_id: j.id,
                booking_id: j.booking_id,
                vehicle_id: j.vehicle_id,
                vehicle_number: v ? v.vehicle_number : 'N/A',
                brand: v ? v.brand : '',
                model: v ? v.model : '',
                customer_id: j.customer_id,
                customer_name: c ? c.name : '',
                customer_phone: c ? c.phone : '',
                service_type: b ? b.service_type : 'General Service',
                service_name: b ? b.service_type : 'General Service',
                booking_date: b ? b.booking_date : '',
                job_status: j.status,
                technician_name: t ? t.name : 'Unassigned',
                work_description: j.work_description || '',
                total_amount: inv ? inv.total_amount : 0.00,
                invoice_amount: inv ? inv.total_amount : 0.00,
                payment_status: inv ? inv.payment_status : 'Pending',
                created_at: j.created_at
            });
        });

        // Add bookings that don't have job cards yet
        const existingJobBookingIds = new Set(mockStore.job_cards.map(j => j.booking_id));
        mockStore.bookings.forEach(b => {
            if (!existingJobBookingIds.has(b.id)) {
                const v = mockStore.vehicles.find(item => item.id == b.vehicle_id);
                const c = mockStore.customers.find(item => item.id == b.customer_id);
                history.push({
                    job_card_id: null,
                    booking_id: b.id,
                    vehicle_id: b.vehicle_id,
                    vehicle_number: v ? v.vehicle_number : 'N/A',
                    brand: v ? v.brand : '',
                    model: v ? v.model : '',
                    customer_id: b.customer_id,
                    customer_name: c ? c.name : '',
                    customer_phone: c ? c.phone : '',
                    service_type: b.service_type,
                    service_name: b.service_type,
                    booking_date: b.booking_date,
                    job_status: b.status,
                    technician_name: 'Unassigned',
                    work_description: b.notes || 'Service Appointment',
                    total_amount: 0.00,
                    invoice_amount: 0.00,
                    payment_status: 'Pending',
                    created_at: b.created_at || new Date()
                });
            }
        });

        // Apply filters if parameters exist
        if (params && params.length > 0) {
            const rawSearch = String(params[0]).replace(/%/g, '').trim().toUpperCase();
            const cleanSearch = rawSearch.replace(/\s+/g, '');
            if (rawSearch) {
                history = history.filter(h => {
                    const vNum = String(h.vehicle_number || '').toUpperCase();
                    const vClean = vNum.replace(/\s+/g, '');
                    const matchVeh = String(h.vehicle_id) === rawSearch || vNum.includes(rawSearch) || (cleanSearch && vClean.includes(cleanSearch));
                    const matchCust = String(h.customer_name || '').toUpperCase().includes(rawSearch);
                    const matchTech = String(h.technician_name || '').toUpperCase().includes(rawSearch);
                    const matchServ = String(h.service_type || '').toUpperCase().includes(rawSearch);
                    return matchVeh || matchCust || matchTech || matchServ;
                });
            }
        }

        return history;
    }

    return [];
}

module.exports = {
    query,
    getIsConnected: () => isRealMySQLConnected
};
