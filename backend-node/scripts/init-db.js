const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  console.log('🚀 Kết nối database thành công...');

  const dbName = process.env.DB_NAME || 'shop_acc_game';

  try {
    // Tạo database nếu chưa có
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`USE ${dbName}`);

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('⏳ Đang khởi tạo cấu trúc database...');
    
    // Thực thi toàn bộ schema
    await connection.query(schema);

    console.log('✅ Đã cập nhật database thành công!');
    console.log('✨ Các bảng đã tạo: users, categories, ranks, accounts, blind_bags, orders, transactions, news...');
  } catch (err) {
    console.error('❌ Lỗi khi khởi tạo database:', err.message);
  } finally {
    await connection.end();
    process.exit();
  }
}

initDb();
