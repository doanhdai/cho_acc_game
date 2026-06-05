const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const register = async (req, res) => {
  const { username, email, password, full_name, phone_zalo } = req.body;
  
  if (!username || !email || !password || !phone_zalo) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin bắt buộc gồm Username, Email, Mật khẩu và Số điện thoại Zalo' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username hoặc Email đã tồn tại' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, full_name, phone_zalo, role, balance, frozen_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name || username, phone_zalo, 'user', 0, 0]
    );
    
    const token = jwt.sign(
      { id: result.insertId, username, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Đăng ký thành công', 
      token, 
      user: { 
        id: result.insertId, 
        username, 
        role: 'user', 
        balance: 0, 
        frozen_balance: 0, 
        phone_zalo,
        full_name: full_name || username 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không đúng' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    const { password: _, ...userInfo } = user;
    res.json({ success: true, message: 'Đăng nhập thành công', token, user: userInfo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, email, full_name, role, balance, frozen_balance, avatar, phone_zalo FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }
    res.json({ success: true, user: users[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe };
