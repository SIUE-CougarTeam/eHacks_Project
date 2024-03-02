// server.js
const express = require('express');
const userRoutes = require('./Users/users.js');
const engineRoutes = require('./Engine/engine.js');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Check that header x-api-key is present and valid
// Route traffic to the appropriate router
// app.use((req, res, next) => {
//   const apiKey = req.headers['x-api-key'];
//   //console.log('headers:', req.headers);
//   if (!apiKey) {
//     return res.status(401).json({ error: 'Missing x-api-key header' });
//   }else if(apiKey == process.env.API_KEY){
//     next();
//   }else{
//     return res.status(401).json({ error: 'Invalid x-api-key header' });
//   }
// });

// Route traffic to the appropriate router
app.use('/users', userRoutes);
app.use('/engine', engineRoutes);

// Function to test the database connection
async function testDbConnection() {
  try {
    const [rows] = await db.query('SELECT 1');
    if (rows[0] && rows[0]['1'] === 1) {
      console.log('[server.js] Database connection is established.');
    } else {
      console.error('[server.js] Database connection test failed.');
    }
  } catch (error) {
    console.error('[server.js] Error testing the database connection:', error);
  }
}

// Catch-all 404 Not Found middleware
app.use((req, res) => {
  res.status(404).sendFile(__dirname + '/404.html');
});

// Close the database connection pool when the application is shutting down
process.on('SIGINT', () => {
  console.log('[server.js] Closing database connection pool...');
  db.closeDbConnection();
  process.exit();
});

app.listen(port, () => {
  console.log(`[server.js] Server is running on port ${port}`);
});

