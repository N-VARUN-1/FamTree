// const mysql = require('mysql2');
import mysql from 'mysql2/promise'

// create the connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root@sql',
    database: 'famtreeDB',
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
