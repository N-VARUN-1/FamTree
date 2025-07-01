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
    waitForConnections: true, // Queue requests if no connections available
    connectionLimit: 10, // Max connections in pool
    queueLimit: 0, // Unlimited queued requests
    ssl: {
        rejectUnauthorized: false // Required for Railway's self-signed cert
    }
});

db.getConnection()
    .then(connection => {
        console.log("✅ Connected to the MySQL database!");
        connection.release(); // Release the connection back to the pool
    })
    .catch(error => {
        console.error("❌ Connection error:", error);
    });

export default db;
