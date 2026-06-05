const pool = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const [cats] = await pool.query(
      `SELECT c.*, COUNT(a.id) as account_count FROM categories c
       LEFT JOIN accounts a ON a.category_id = c.id AND a.status = 'SHOWING'
       GROUP BY c.id`
    );
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSkins = async (req, res) => {
  try {
    const { champion } = req.query;
    let sql = 'SELECT * FROM skins';
    const params = [];
    if (champion) {
      sql += ' WHERE champion_name = ?';
      params.push(champion);
    }
    sql += ' ORDER BY champion_name ASC, skin_name ASC';
    const [skins] = await pool.query(sql, params);
    res.json({ success: true, data: skins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createAccount = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const userId = req.user.id;
    const {
      category_id, title, description, price, original_price,
      username, password, email_acc, email_pass,
      server, level, rank_level, champions_count, skins_count,
      security_status, images, skin_ids
    } = req.body;

    if (!category_id || !title || !price || !username || !password) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' });
    }

    // 1. Kiểm tra số dư ví (Yêu cầu phí đăng tin là 5,000đ)
    const [[user]] = await conn.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [userId]);
    const balance = Number(user.balance);
    if (balance < 5000) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Số dư ví của bạn không đủ để thanh toán phí đăng bài (5.000đ). Vui lòng nạp thêm tiền.' });
    }

    // 2. Trừ 5,000đ
    const newBalance = balance - 5000;
    await conn.query('UPDATE users SET balance = balance - 5000 WHERE id = ?', [userId]);

    // 3. Đăng tin
    const [accResult] = await conn.query(
      `INSERT INTO accounts (
        seller_id, category_id, title, description, price, original_price,
        username, password, email_acc, email_pass, server, level, rank_level,
        champions_count, skins_count, security_status, status, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SHOWING', ?)`,
      [
        userId, category_id, title, description || '', price, original_price || null,
        username, password, email_acc || null, email_pass || null, server || null, level || null, rank_level || null,
        champions_count || 0, skins_count || 0, security_status || 'TRANG_THONG_THIN', JSON.stringify(images || [])
      ]
    );
    const accountId = accResult.insertId;

    // 4. Lưu liên kết skin nổi bật
    if (skin_ids && Array.isArray(skin_ids) && skin_ids.length > 0) {
      const skinValues = skin_ids.map(skinId => [accountId, skinId]);
      await conn.query('INSERT INTO account_skins (account_id, skin_id) VALUES ?', [skinValues]);
    }

    // 5. Ghi log giao dịch ví
    await conn.query(
      'INSERT INTO transactions (user_id, amount, type, balance_before, balance_after, description, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, 5000, 'POST_FEE', balance, newBalance, `Phí đăng tin bán acc: ${title}`, accountId]
    );

    await conn.commit();
    res.json({ success: true, message: 'Đăng tin thành công!', accountId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

const getAccounts = async (req, res) => {
  try {
    const {
      category, search, price_min, price_max, rank,
      skin_ids, sort = 'created_at', order = 'DESC', page = 1, limit = 12
    } = req.query;

    let where = ["a.status = 'SHOWING'"];
    const params = [];

    if (category) {
      where.push('c.slug = ?');
      params.push(category);
    }
    if (search) {
      where.push('(a.title LIKE ? OR a.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (price_min) {
      where.push('a.price >= ?');
      params.push(Number(price_min));
    }
    if (price_max) {
      where.push('a.price <= ?');
      params.push(Number(price_max));
    }
    if (rank) {
      where.push('a.rank_level = ?');
      params.push(rank);
    }

    let joinSkins = '';
    // Lọc theo skin nổi bật (nếu có mảng skin_ids)
    if (skin_ids) {
      let idsArr = [];
      if (Array.isArray(skin_ids)) {
        idsArr = skin_ids.map(Number);
      } else {
        idsArr = skin_ids.split(',').map(Number);
      }
      
      if (idsArr.length > 0) {
        joinSkins = `JOIN account_skins ask ON a.id = ask.account_id`;
        where.push(`ask.skin_id IN (${idsArr.join(',')})`);
      }
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

    let selectQuery = `
      SELECT a.*, c.name AS category_name, c.slug AS category_slug, u.username AS seller_name, u.phone_zalo AS seller_phone
      FROM accounts a 
      JOIN categories c ON a.category_id = c.id
      JOIN users u ON a.seller_id = u.id
      ${joinSkins}
      ${whereStr} 
    `;

    if (joinSkins) {
      let idsArr = Array.isArray(skin_ids) ? skin_ids.map(Number) : skin_ids.split(',').map(Number);
      selectQuery += ` GROUP BY a.id HAVING COUNT(DISTINCT ask.skin_id) = ${idsArr.length}`;
    }

    selectQuery += ` ORDER BY a.${sort} ${order} LIMIT ? OFFSET ?`;

    const [accounts] = await pool.query(selectQuery, [...params, parseInt(limit), offset]);

    let countQuery = `
      SELECT COUNT(DISTINCT a.id) as total 
      FROM accounts a 
      JOIN categories c ON a.category_id = c.id
      ${joinSkins}
      ${whereStr}
    `;
    const [[{ total }]] = await pool.query(countQuery, params);

    res.json({ success: true, data: accounts, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAccountById = async (req, res) => {
  try {
    const accountId = req.params.id;
    const [accounts] = await pool.query(
      `SELECT a.*, c.name AS category_name, c.slug AS category_slug, u.username AS seller_name, u.phone_zalo AS seller_phone
       FROM accounts a 
       JOIN categories c ON a.category_id = c.id
       JOIN users u ON a.seller_id = u.id
       WHERE a.id = ?`,
      [accountId]
    );

    if (accounts.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy acc' });
    }

    const account = accounts[0];

    // Tăng lượt xem
    await pool.query('UPDATE accounts SET view_count = view_count + 1 WHERE id = ?', [accountId]);

    // Lấy danh sách skins nổi bật của acc này
    const [skins] = await pool.query(
      `SELECT s.* FROM skins s JOIN account_skins ask ON s.id = ask.skin_id WHERE ask.account_id = ?`,
      [accountId]
    );
    account.skins_list = skins;

    // Kiểm tra quyền xem thông tin tài khoản (username, password, email)
    // Người bán, người mua (khi đơn hàng kết thúc) hoặc admin được xem.
    const isSeller = req.user && req.user.id === account.seller_id;
    const isAdmin = req.user && req.user.role === 'admin';
    const isBuyer = req.user ? await checkBuyer(req.user.id, accountId) : false;

    if (!isSeller && !isAdmin && !isBuyer) {
      account.username = '***';
      account.password = '***';
      account.email_acc = account.email_acc ? '***' : null;
      account.email_pass = account.email_pass ? '***' : null;
    }

    res.json({ success: true, data: account });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function checkBuyer(userId, accountId) {
  const [rows] = await pool.query(
    `SELECT id FROM orders WHERE buyer_id = ? AND account_id = ? AND status = 'COMPLETED'`,
    [userId, accountId]
  );
  return rows.length > 0;
}

module.exports = { getCategories, getSkins, createAccount, getAccounts, getAccountById };
