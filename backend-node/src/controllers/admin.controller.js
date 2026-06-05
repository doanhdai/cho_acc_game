const pool = require('../config/db');

const adminGetAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    let where = [];
    const params = [];
    if (status) { where.push('a.status = ?'); params.push(status); }
    if (category) { where.push('a.category_id = ?'); params.push(category); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const [accounts] = await pool.query(
      `SELECT a.*, c.name AS category_name, u.username AS seller_name 
       FROM accounts a 
       JOIN categories c ON a.category_id = c.id 
       JOIN users u ON a.seller_id = u.id
       ${whereStr} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM accounts a ${whereStr}`, params);
    res.json({ success: true, data: accounts, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminCreateAccount = async (req, res) => {
  const {
    category_id, title, description, price, original_price,
    username, password, email_acc, email_pass,
    server, level, rank_level, champions_count, skins_count,
    security_status, images, is_featured
  } = req.body;
  try {
    const sellerId = req.user.id; // Admin làm người bán mặc định cho bài viết của admin
    const [result] = await pool.query(
      `INSERT INTO accounts (
        seller_id, category_id, title, description, price, original_price,
        username, password, email_acc, email_pass, server, level, rank_level,
        champions_count, skins_count, security_status, status, images, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SHOWING', ?, ?)`,
      [
        sellerId, category_id, title, description || '', price, original_price || null,
        username, password, email_acc || null, email_pass || null, server || null, level || null, rank_level || null,
        champions_count || 0, skins_count || 0, security_status || 'TRANG_THONG_THIN',
        JSON.stringify(images || []), is_featured ? 1 : 0
      ]
    );
    res.json({ success: true, message: 'Thêm acc thành công', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminUpdateAccount = async (req, res) => {
  const fields = req.body;
  const id = req.params.id;
  try {
    if (fields.images) fields.images = JSON.stringify(fields.images);
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu cập nhật' });
    }
    const setStr = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE accounts SET ${setStr} WHERE id = ?`, [...values, id]);
    res.json({ success: true, message: 'Cập nhật acc thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminDeleteAccount = async (req, res) => {
  try {
    await pool.query("UPDATE accounts SET status = 'HIDDEN' WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Đã ẩn acc thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Skin Directory Management (Quản lý Data Game)
const adminGetSkins = async (req, res) => {
  try {
    const [skins] = await pool.query('SELECT * FROM skins ORDER BY champion_name ASC, skin_name ASC');
    res.json({ success: true, data: skins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminCreateSkin = async (req, res) => {
  const { champion_name, skin_name, image_url } = req.body;
  if (!champion_name || !skin_name || !image_url) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Tên tướng, Tên skin và Ảnh skin' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO skins (champion_name, skin_name, image_url) VALUES (?, ?, ?)',
      [champion_name, skin_name, image_url]
    );
    res.json({ success: true, message: 'Thêm skin thành công', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminUpdateSkin = async (req, res) => {
  const { champion_name, skin_name, image_url } = req.body;
  const id = req.params.id;
  try {
    await pool.query(
      'UPDATE skins SET champion_name = ?, skin_name = ?, image_url = ? WHERE id = ?',
      [champion_name, skin_name, image_url, id]
    );
    res.json({ success: true, message: 'Cập nhật skin thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminDeleteSkin = async (req, res) => {
  try {
    await pool.query('DELETE FROM skins WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa skin thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Escrow Orders
const adminGetOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, a.title AS account_title, b.username AS buyer_name, s.username AS seller_name 
       FROM orders o 
       JOIN accounts a ON o.account_id = a.id
       JOIN users b ON o.buyer_id = b.id
       JOIN users s ON o.seller_id = s.id
       ORDER BY o.created_at DESC`
    );
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Deposits
const adminGetDeposits = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let where = [];
    const params = [];
    if (status) { where.push('d.status = ?'); params.push(status); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const [deposits] = await pool.query(
      `SELECT d.*, u.username, u.email, u.full_name FROM deposit_requests d JOIN users u ON d.user_id = u.id
       ${whereStr} ORDER BY d.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM deposit_requests d ${whereStr}`, params);
    res.json({ success: true, data: deposits, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminApproveDeposit = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { admin_note } = req.body;
    const id = req.params.id;
    const [[dep]] = await conn.query("SELECT * FROM deposit_requests WHERE id = ? AND status = 'pending' FOR UPDATE", [id]);
    if (!dep) { 
      await conn.rollback(); 
      return res.status(400).json({ success: false, message: 'Không tìm thấy yêu cầu pending' }); 
    }

    await conn.query(
      "UPDATE deposit_requests SET status='approved', processed_by=?, processed_at=NOW(), admin_note=? WHERE id=?",
      [req.user.id, admin_note || null, id]
    );
    const amount = Number(dep.amount);
    const [[user]] = await conn.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [dep.user_id]);
    const balanceBefore = Number(user.balance);

    await conn.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, dep.user_id]);
    await conn.query(
      'INSERT INTO transactions (user_id, amount, type, balance_before, balance_after, description, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [dep.user_id, amount, 'DEPOSIT', balanceBefore, balanceBefore + amount, 'Nạp tiền duyệt bởi Admin', id]
    );

    await conn.commit();
    res.json({ success: true, message: 'Đã duyệt nạp tiền thành công' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

const adminRejectDeposit = async (req, res) => {
  try {
    const { admin_note } = req.body;
    await pool.query(
      "UPDATE deposit_requests SET status='rejected', processed_by=?, processed_at=NOW(), admin_note=? WHERE id=? AND status='pending'",
      [req.user.id, admin_note || 'Từ chối', req.params.id]
    );
    res.json({ success: true, message: 'Đã từ chối yêu cầu nạp tiền' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Revenue Analytics
const adminGetRevenue = async (req, res) => {
  try {
    // 1. Phí giao dịch trung gian (3% từ các đơn hàng hoàn tất)
    const [[feeRes]] = await pool.query("SELECT SUM(fee) as total FROM orders WHERE status='COMPLETED'");
    const middlemanRevenue = parseFloat(feeRes.total) || 0;

    // 2. Phí đăng tin của người bán (5,000đ từ transactions type='POST_FEE')
    const [[postRes]] = await pool.query("SELECT COUNT(*) * 5000 as total FROM transactions WHERE type='POST_FEE'");
    const postingRevenue = parseFloat(postRes.total) || 0;

    const totalRevenue = middlemanRevenue + postingRevenue;

    const [[totalDeposits]] = await pool.query("SELECT SUM(amount) as total FROM deposit_requests WHERE status='approved'");
    const [[pendingDeposits]] = await pool.query("SELECT COUNT(*) as count, SUM(amount) as total FROM deposit_requests WHERE status='pending'");

    // Monthly breakdown
    const [monthly] = await pool.query(`
      SELECT month, SUM(amount) as revenue, SUM(orders_count) as orders
      FROM (
        SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(fee) as amount, COUNT(*) as orders_count
        FROM orders WHERE status='COMPLETED' GROUP BY month
        UNION ALL
        SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as amount, COUNT(*) as orders_count
        FROM transactions WHERE type='POST_FEE' GROUP BY month
      ) combined GROUP BY month ORDER BY month DESC LIMIT 12
    `);

    // Top depositors
    const [topUsers] = await pool.query(`
      SELECT u.id, u.username, u.full_name, 
             IFNULL((SELECT SUM(amount) FROM deposit_requests WHERE user_id = u.id AND status = 'approved'), 0) as total_deposited
      FROM users u 
      WHERE u.role='user' 
      ORDER BY total_deposited DESC 
      LIMIT 10
    `);

    const [[totalUsers]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role='user'");
    const [[totalAccounts]] = await pool.query("SELECT COUNT(*) as total, SUM(CASE WHEN status='SHOWING' THEN 1 ELSE 0 END) as available FROM accounts");

    res.json({
      success: true,
      data: {
        totalRevenue,
        orderRevenue: middlemanRevenue,
        blindBagRevenue: postingRevenue, // Đổi nhãn từ Túi mù sang Phí Đăng tin
        totalDeposits: parseFloat(totalDeposits.total) || 0,
        pendingDeposits,
        monthly,
        topUsers,
        totalUsers: totalUsers.count,
        totalAccounts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminGetUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let where = [];
    const params = [];
    if (search) { 
      where.push('(username LIKE ? OR email LIKE ? OR full_name LIKE ?)'); 
      params.push(`%${search}%`, `%${search}%`, `%${search}%`); 
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    
    const [users] = await pool.query(
      `SELECT id, username, email, full_name, phone_zalo, balance, frozen_balance, role, created_at,
              IFNULL((SELECT SUM(amount) FROM deposit_requests WHERE user_id = users.id AND status = 'approved'), 0) as total_deposited
       FROM users ${whereStr} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM users ${whereStr}`, params);
    res.json({ success: true, data: users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminGetHistory = async (req, res) => {
  try {
    const { page = 1, limit = 30, type } = req.query;
    let where = [];
    const params = [];
    if (type) { where.push('t.type = ?'); params.push(type); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const [transactions] = await pool.query(
      `SELECT t.*, u.username FROM transactions t JOIN users u ON t.user_id = u.id ${whereStr} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM transactions t ${whereStr}`, params);
    res.json({ success: true, data: transactions, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminGetNews = async (req, res) => {
  try {
    const [news] = await pool.query('SELECT n.*, u.username AS author FROM news n LEFT JOIN users u ON n.author_id = u.id ORDER BY n.created_at DESC');
    res.json({ success: true, data: news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminCreateNews = async (req, res) => {
  const { title, content, excerpt, thumbnail, category, is_published } = req.body;
  const slugify = require('slugify');
  const slug = slugify(title, { lower: true, strict: true, locale: 'vi' }) + '-' + Date.now();
  try {
    const [result] = await pool.query(
      'INSERT INTO news (title, slug, content, excerpt, thumbnail, category, is_published, author_id) VALUES (?,?,?,?,?,?,?,?)',
      [title, slug, content, excerpt, thumbnail, category || 'news', is_published ? 1 : 0, req.user.id]
    );
    res.json({ success: true, message: 'Tạo bài viết thành công', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminUpdateNews = async (req, res) => {
  const { title, content, excerpt, thumbnail, category, is_published } = req.body;
  try {
    await pool.query(
      'UPDATE news SET title=?, content=?, excerpt=?, thumbnail=?, category=?, is_published=? WHERE id=?',
      [title, content, excerpt, thumbnail, category, is_published ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Cập nhật bài viết thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminDeleteNews = async (req, res) => {
  try {
    await pool.query('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa bài viết' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  adminGetAccounts, adminCreateAccount, adminUpdateAccount, adminDeleteAccount,
  adminGetSkins, adminCreateSkin, adminUpdateSkin, adminDeleteSkin,
  adminGetOrders,
  adminGetDeposits, adminApproveDeposit, adminRejectDeposit,
  adminGetRevenue, adminGetUsers, adminGetHistory,
  adminGetNews, adminCreateNews, adminUpdateNews, adminDeleteNews
};
