// backend/index.js
// --------------------------------------------------------
// ✅ Express + PostgreSQL + Socket.IO Integration Server
// --------------------------------------------------------

const express = require('express');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3001;

// --------------------------------------------------------
// 2. Database Connection Pool Setup
// --------------------------------------------------------
const pool = new Pool({
    user: process.env.DB_USER || 'hab',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'table-serve-web',
    password: process.env.DB_PASSWORD || '123456',
    port: process.env.DB_PORT || 5432,
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Note: It's usually safer not to exit in production unless pool is completely broken
});

// Helper to query the DB
const query = (text, params) => pool.query(text, params);

// --------------------------------------------------------
// 3. Database Initialization (Table Creation & Seeding)
// --------------------------------------------------------

async function initDb() {
    console.log('--- Initializing Database ---');
    try {
        // 3a. Create Users Table (already exists, ensuring it's still defined)
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'kitchenmanager', 'servicemanager', 'cashier', 'waiter'))
            );
        `);
        
        // 3b. Create Dining Tables Table
        await query(`
            CREATE TABLE IF NOT EXISTS dining_tables (
                table_id SERIAL PRIMARY KEY,
                table_number VARCHAR(10) UNIQUE NOT NULL,
                capacity INTEGER NOT NULL DEFAULT 2,
                status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'cleaning', 'reserved'))
            );
        `);

        // 3c. Create Menu Categories Table
        await query(`
            CREATE TABLE IF NOT EXISTS menu_categories (
                category_id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL
            );
        `);

        // 3d. Seed initial data if tables are empty
        
        // Seed Admin User
        const userRes = await query('SELECT COUNT(*) FROM users');
        if (parseInt(userRes.rows[0].count) === 0) {
            await query("INSERT INTO users (username, password, role) VALUES ('admin', 'adminpass', 'admin')");
            console.log('Initial admin user created (admin/adminpass).');
        }
        
        // Seed some Dining Tables
        const tableRes = await query('SELECT COUNT(*) FROM dining_tables');
        if (parseInt(tableRes.rows[0].count) === 0) {
            await query("INSERT INTO dining_tables (table_number, capacity) VALUES ('T01', 4), ('T02', 2), ('T03', 6), ('T04', 4)");
            console.log('Initial dining tables created.');
        }

        // Seed some Menu Categories
        const categoryRes = await query('SELECT COUNT(*) FROM menu_categories');
        if (parseInt(categoryRes.rows[0].count) === 0) {
            await query("INSERT INTO menu_categories (name) VALUES ('Appetizers'), ('Main Courses'), ('Desserts'), ('Drinks')");
            console.log('Initial menu categories created.');
        }


        console.log('Database schema and initial data ensured.');

    } catch (err) {
        console.error('Database initialization failed:', err.message);
    }
}

// --------------------------------------------------------
// 4. Express Middleware
// --------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// --------------------------------------------------------
// 5. API Routes
// --------------------------------------------------------

// Health Check API
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running fine!' });
});

// Login API Route (Unchanged)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required.' });
    }

    try {
        const result = await query('SELECT user_id, username, role, password FROM users WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        const user = result.rows[0];

        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        res.json({
            success: true,
            user: {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// --- Table Management Routes ---

// GET all dining tables
app.get('/api/tables', async (req, res) => {
    try {
        const result = await query('SELECT * FROM dining_tables ORDER BY table_number');
        res.json({ success: true, tables: result.rows });
    } catch (err) {
        console.error('Fetch tables error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch tables.' });
    }
});

// PUT update table status (CRITICAL real-time route)
app.put('/api/tables/:id/status', async (req, res) => {
    const tableId = req.params.id;
    const { status } = req.body;
    const io = req.app.get('io'); // Get the Socket.IO instance

    const validStatuses = ['available', 'occupied', 'cleaning', 'reserved'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid table status.' });
    }

    try {
        // 1. Update the database
        const result = await query(
            'UPDATE dining_tables SET status = $1 WHERE table_id = $2 RETURNING *',
            [status, tableId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Table not found.' });
        }

        const updatedTable = result.rows[0];

        // 2. Broadcast the update to all connected clients
        io.emit('tableStatusUpdate', updatedTable); 
        console.log(`[Socket.IO] Broadcast: Table ${updatedTable.table_number} status changed to ${status}`);

        res.json({ success: true, table: updatedTable });
    } catch (err) {
        console.error('Update table status error:', err);
        res.status(500).json({ success: false, message: 'Failed to update table status.' });
    }
});


// --------------------------------------------------------
// 6. Startup and Socket.IO Integration
// --------------------------------------------------------

const server = http.createServer(app);

// Initialize Socket.IO Server
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST", "PUT"] // Added PUT method for safety
    }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
});

// Attach io (Socket.IO instance) to the Express app object so it can be accessed in routes
app.set('io', io);

// Fallback route for React Router (Guaranteed Fix)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start the database initialization and then the server
initDb().then(() => {
    server.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`[Socket.IO] Listening on port ${PORT}`);
        console.log('Database initialization complete.');
    });
});