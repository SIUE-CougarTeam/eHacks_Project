// db.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

//console.log('dbConfig: ', dbConfig);

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Execute a query using the pool
async function query(sql, values) {
  try {
    const [rows, fields] = await pool.execute(sql, values);
    return rows;
  } catch (error) {
    console.error('Error executing query:', error.message);
    throw error; // Re-throw the error to propagate it to the calling code
  }
}

// Test the database connection
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('[db.js] Database connection test is successful.');
  } catch (error) {
    console.error('[db.js] Database connection test failed:', error.message);
  }
}

// Close the entire pool when the application is shutting down
function closeDbConnection() {
  pool.end();
  console.log('[db.js] Database connection pool is closed.');
}

// Call the test function to check the database connection status
testDbConnection();

module.exports = { query, closeDbConnection };
