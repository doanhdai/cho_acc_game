require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Auth middleware injection
const { auth } = require('./middleware/auth.middleware');
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {}
  }
  next();
});

// Database initialization helper endpoint
app.get('/api/init-db', async (req, res) => {
  const mysql = require('mysql2/promise');
  const fs = require('fs');
  const path = require('path');
  const dbName = process.env.DB_NAME || 'shop_acc_game';
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`USE ${dbName}`);
    
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await connection.query(schema);
    await connection.end();
    
    res.json({ success: true, message: 'Database initialized and seeded successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/accounts', require('./routes/account.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/news', require('./routes/news.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

module.exports = app;
