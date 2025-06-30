// const mysql = require('mysql2');
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config();

// create the connection
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    connectTimeout: 60000, // 60 seconds timeout
    acquireTimeout: 60000, // 60 seconds to get connection
    waitForConnections: true, // Queue requests if no connections available
    connectionLimit: 10, // Max connections in pool
    queueLimit: 0, // Unlimited queued requests
    ssl: {
        rejectUnauthorized: false // Required for Railway
    },
});

// connect to database
// db.connect((err) => {
//     if (err) {
//         console.error('Database connection failed:', err.stack);
//         return;
//     }
//     console.log('Connected to database.');
// });

export default db;
