const { Pool } = require('pg');
const fs = require('fs'); //importing File System module

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'bookstore_test',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432
});

module.exports = async () => {
    const sql = fs.readFileSync(__dirname + '/setup.sql').toString();
    await pool.query(sql); //executing the SQL script to set up the test database
    await pool.end(); //closing the database connection
};
