const pool = require('../config/db');

const createDeposit = async (req, res) => {
  const { amount, method, transaction_ref, note } = req.body;
  if (!amount || amount < 10000) {
    return res.status(400).json({ success: false, message: 'Số tiền nạp tối thiểu là 10,000đ' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO deposit_requests (user_id, amount, method, transaction_ref, note) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, amount, method || 'bank_transfer', transaction_ref || null, note || null]
    );
    res.json({ success: true, message: 'Yêu cầu nạp tiền đã được gửi. Vui lòng chờ admin xét duyệt.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyDeposits = async (req, res) => {
  try {
    const [deposits] = await pool.query(
      'SELECT * FROM deposit_requests WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: deposits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.user.id, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM transactions WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, data: transactions, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Tài khoản đã mua trực tiếp / qua trung gian (đã hoàn thành)
    const [purchased] = await pool.query(
      `SELECT o.*, a.title, a.username, a.password, a.email_acc, a.email_pass, a.server, a.level, a.rank_level, a.images, c.name AS category_name
       FROM orders o 
       JOIN accounts a ON o.account_id = a.id 
       JOIN categories c ON a.category_id = c.id
       WHERE o.buyer_id = ? OR o.seller_id = ?
       ORDER BY o.created_at DESC`,
      [userId, userId]
    );
    
    // 2. Tài khoản đang bán (listings của user đó)
    const [listings] = await pool.query(
      `SELECT a.*, c.name AS category_name
       FROM accounts a
       JOIN categories c ON a.category_id = c.id
       WHERE a.seller_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );

    res.json({ success: true, orders: purchased, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { full_name, email, phone_zalo, avatar } = req.body;
  try {
    if (email) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Email đã được sử dụng bởi tài khoản khác' });
      }
    }

    await pool.query(
      'UPDATE users SET full_name = ?, email = ?, phone_zalo = ?, avatar = ? WHERE id = ?',
      [full_name || null, email || null, phone_zalo || null, avatar || null, req.user.id]
    );

    const [updatedUser] = await pool.query('SELECT id, username, email, full_name, role, balance, frozen_balance, avatar, phone_zalo FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, message: 'Cập nhật thông tin thành công', user: updatedUser[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createDeposit, getMyDeposits, getMyHistory, getMyAccounts, updateProfile };
