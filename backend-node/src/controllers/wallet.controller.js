const pool = require('../config/db');

const walletCallback = async (req, res) => {
  // Nhận description/note và amount từ body của Bank Webhook
  const { description, amount } = req.body;
  
  if (!description || !amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ. Cần truyền description và amount.' });
  }

  // Parse cú pháp NAP_USER123 hoặc NAP_USER_123
  const match = description.match(/NAP_USER(\d+)/i);
  if (!match) {
    return res.status(400).json({ success: false, message: 'Nội dung chuyển khoản không đúng cú pháp nạp tiền (NAP_USER[ID])' });
  }

  const userId = parseInt(match[1]);
  const depositAmount = Number(amount);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Khóa dòng user
    const [users] = await conn.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (users.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng có ID này' });
    }

    const currentBalance = Number(users[0].balance);
    const newBalance = currentBalance + depositAmount;

    // Cộng số dư ví
    await conn.query('UPDATE users SET balance = balance + ? WHERE id = ?', [depositAmount, userId]);

    // Tạo yêu cầu nạp tiền tự động duyệt
    const [depRes] = await conn.query(
      "INSERT INTO deposit_requests (user_id, amount, method, transaction_ref, note, status, admin_note, processed_at) VALUES (?, ?, ?, ?, ?, 'approved', ?, NOW())",
      [userId, depositAmount, 'bank_transfer', `AUTO${Date.now()}`, description, 'VietQR Auto Webhook']
    );

    // Ghi log giao dịch ví
    await conn.query(
      'INSERT INTO transactions (user_id, amount, type, balance_before, balance_after, description, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, depositAmount, 'DEPOSIT', currentBalance, newBalance, `Nạp tiền tự động qua VietQR: ${description}`, depRes.insertId]
    );

    await conn.commit();
    res.json({ success: true, message: `Nạp tiền tự động thành công cho User #${userId}. Đã cộng ${depositAmount}đ vào ví.` });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

module.exports = { walletCallback };
