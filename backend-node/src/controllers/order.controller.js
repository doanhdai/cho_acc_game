const pool = require('../config/db');

const createMiddlemanOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const buyerId = req.user.id;
    const { account_id } = req.body;

    if (!account_id) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Thiếu ID tài khoản cần mua' });
    }

    // 1. Lấy thông tin tài khoản và kiểm tra trạng thái
    const [[acc]] = await conn.query('SELECT * FROM accounts WHERE id = ? FOR UPDATE', [account_id]);
    if (!acc) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản game' });
    }

    if (acc.status !== 'SHOWING') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Tài khoản này hiện không sẵn sàng giao dịch (Đã bán hoặc đang có giao dịch khác)' });
    }

    if (acc.seller_id === buyerId) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Bạn không thể tự mua tài khoản của chính mình' });
    }

    const price = Number(acc.price);

    // 2. Kiểm tra số dư người mua
    const [[buyer]] = await conn.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [buyerId]);
    const balance = Number(buyer.balance);
    if (balance < price) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Số dư ví không đủ. Cần thêm ${price - balance}đ để thực hiện giao dịch.` });
    }

    // 3. Khấu trừ số tiền từ balance và đẩy vào frozen_balance của người mua
    await conn.query('UPDATE users SET balance = balance - ?, frozen_balance = frozen_balance + ? WHERE id = ?', [price, price, buyerId]);

    // 4. Đổi trạng thái bài đăng sang IN_TRANSACTION
    await conn.query("UPDATE accounts SET status = 'IN_TRANSACTION' WHERE id = ?", [account_id]);

    // 5. Tạo đơn hàng trung gian (phí sàn mặc định 3%)
    const fee = price * 0.03;
    const [orderRes] = await conn.query(
      'INSERT INTO orders (buyer_id, seller_id, account_id, amount, fee, status) VALUES (?, ?, ?, ?, ?, ?)',
      [buyerId, acc.seller_id, account_id, price, fee, 'PENDING']
    );
    const orderId = orderRes.insertId;

    // 6. Ghi log giao dịch ví người mua
    await conn.query(
      'INSERT INTO transactions (user_id, amount, type, balance_before, balance_after, description, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [buyerId, price, 'MIDDLEMAN_HOLD', balance, balance - price, `Đóng băng tiền mua acc qua trung gian: ${acc.title}`, orderId]
    );

    // 7. Nhắn tin hệ thống chào mừng phòng chat
    await conn.query(
      'INSERT INTO messages (order_id, sender_id, message) VALUES (?, ?, ?)',
      [orderId, buyerId, `HỆ THỐNG: Đơn hàng #${orderId} đã được khởi tạo. Số tiền ${price.toLocaleString()}đ đã được khóa an toàn. Admin trung gian sẽ sớm tham gia phòng chat.`]
    );

    await conn.commit();
    res.json({ success: true, message: 'Khởi tạo đơn hàng trung gian thành công!', orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const [orders] = await pool.query(
      `SELECT o.*, 
              a.title AS account_title, a.price AS account_price, a.server, a.level, a.rank_level, a.images,
              b.username AS buyer_name, b.phone_zalo AS buyer_phone,
              s.username AS seller_name, s.phone_zalo AS seller_phone
       FROM orders o
       JOIN accounts a ON o.account_id = a.id
       JOIN users b ON o.buyer_id = b.id
       JOIN users s ON o.seller_id = s.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const order = orders[0];
    const isBuyer = req.user.id === order.buyer_id;
    const isSeller = req.user.id === order.seller_id;
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập vào phòng chat đơn hàng này' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getOrderMessages = async (req, res) => {
  try {
    const orderId = req.params.id;
    const isAdmin = req.user.role === 'admin';

    // Chỉ cho phép admin xem tin nhắn private
    let query = `
      SELECT m.*, u.username AS sender_name, u.role AS sender_role 
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.order_id = ?
    `;
    const params = [orderId];

    if (!isAdmin) {
      query += ' AND m.is_private = 0';
    }
    query += ' ORDER BY m.created_at ASC';

    const [messages] = await pool.query(query, params);
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const sendOrderMessage = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { message, is_private } = req.body;
    const senderId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được trống' });
    }

    // Kiểm tra xem đơn hàng còn PENDING hay đã đóng
    const [orders] = await pool.query('SELECT status FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }
    
    // Gửi tin nhắn
    await pool.query(
      'INSERT INTO messages (order_id, sender_id, message, is_private) VALUES (?, ?, ?, ?)',
      [orderId, senderId, message, isAdmin && is_private ? 1 : 0]
    );

    res.json({ success: true, message: 'Đã gửi tin nhắn' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const completeMiddlemanOrder = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền xác nhận hoàn tất đơn hàng' });
  }

  const orderId = req.params.id;
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    // 1. Khóa và lấy thông tin đơn hàng
    const [[order]] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    if (!order) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status !== 'PENDING') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Đơn hàng đã được xử lý hoàn tất hoặc hủy trước đó' });
    }

    const price = Number(order.amount);
    const fee = Number(order.fee);
    const sellerReceives = price - fee;

    // 2. Trừ tiền đóng băng (frozen_balance) của người mua
    const [[buyer]] = await conn.query('SELECT frozen_balance FROM users WHERE id = ? FOR UPDATE', [order.buyer_id]);
    if (Number(buyer.frozen_balance) < price) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Lỗi đồng bộ: Số dư đóng băng của người mua thấp hơn giá trị đơn hàng' });
    }
    await conn.query('UPDATE users SET frozen_balance = frozen_balance - ? WHERE id = ?', [price, order.buyer_id]);

    // 3. Cộng tiền vào balance cho người bán
    const [[seller]] = await conn.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [order.seller_id]);
    const sellerBefore = Number(seller.balance);
    await conn.query('UPDATE users SET balance = balance + ? WHERE id = ?', [sellerReceives, order.seller_id]);

    // 4. Cập nhật trạng thái đơn hàng và tài khoản game
    await conn.query("UPDATE orders SET status = 'COMPLETED' WHERE id = ?", [orderId]);
    await conn.query("UPDATE accounts SET status = 'SOLD' WHERE id = ?", [order.account_id]);

    // 5. Ghi log ví cho người bán (Nhận tiền)
    await conn.query(
      'INSERT INTO transactions (user_id, amount, type, balance_before, balance_after, description, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [order.seller_id, sellerReceives, 'MIDDLEMAN_RELEASE', sellerBefore, sellerBefore + sellerReceives, `Nhận tiền bán acc trung gian: Đơn #${orderId} (Đã khấu trừ 3% phí sàn)`, orderId]
    );

    // 6. Nhắn tin hệ thống xác nhận hoàn tất
    await conn.query(
      'INSERT INTO messages (order_id, sender_id, message) VALUES (?, ?, ?)',
      [orderId, req.user.id, `HỆ THỐNG: Admin đã xác nhận hoàn tất đơn hàng. Số tiền ${sellerReceives.toLocaleString()}đ đã được chuyển vào ví Người bán. Giao dịch thành công và phòng chat kết thúc.`]
    );

    await conn.commit();
    res.json({ success: true, message: 'Xác nhận hoàn tất đơn hàng thành công, tiền đã giải ngân cho người bán!' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

const cancelMiddlemanOrder = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền hủy đơn hàng trung gian' });
  }

  const orderId = req.params.id;
  const { reason } = req.body;

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lý do hủy đơn hàng' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Khóa và lấy thông tin đơn hàng
    const [[order]] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    if (!order) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status !== 'PENDING') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Đơn hàng đã được xử lý hoàn tất hoặc hủy trước đó' });
    }

    const price = Number(order.amount);

    // 2. Trừ tiền đóng băng (frozen_balance) của người mua và cộng lại ví chính (balance)
    const [[buyer]] = await conn.query('SELECT balance, frozen_balance FROM users WHERE id = ? FOR UPDATE', [order.buyer_id]);
    const buyerBefore = Number(buyer.balance);
    if (Number(buyer.frozen_balance) < price) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Số dư đóng băng người mua không đủ' });
    }
    await conn.query('UPDATE users SET balance = balance + ?, frozen_balance = frozen_balance - ? WHERE id = ?', [price, price, order.buyer_id]);

    // 3. Đổi trạng thái đơn hàng và ẩn tài khoản game (đổi về HIDDEN)
    await conn.query("UPDATE orders SET status = 'CANCELLED', cancel_reason = ? WHERE id = ?", [reason, orderId]);
    await conn.query("UPDATE accounts SET status = 'HIDDEN' WHERE id = ?", [order.account_id]);

    // 4. Ghi log hoàn tiền cho người mua
    await conn.query(
      'INSERT INTO transactions (user_id, amount, type, balance_before, balance_after, description, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [order.buyer_id, price, 'REFUND', buyerBefore, buyerBefore + price, `Hoàn tiền hủy đơn trung gian #${orderId}. Lý do: ${reason}`, orderId]
    );

    // 5. Nhắn tin hệ thống phòng chat
    await conn.query(
      'INSERT INTO messages (order_id, sender_id, message) VALUES (?, ?, ?)',
      [orderId, req.user.id, `HỆ THỐNG: Đơn hàng đã bị hủy bởi Admin. Lý do: ${reason}. Số tiền ${price.toLocaleString()}đ đã được hoàn trả về số dư ví người mua.`]
    );

    await conn.commit();
    res.json({ success: true, message: 'Đã hủy đơn và hoàn trả tiền cho người mua thành công!' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    // Lấy các đơn hàng người dùng tham gia (là người mua hoặc người bán)
    const [orders] = await pool.query(
      `SELECT o.*, a.title AS account_title, a.images, b.username AS buyer_name, s.username AS seller_name
       FROM orders o
       JOIN accounts a ON o.account_id = a.id
       JOIN users b ON o.buyer_id = b.id
       JOIN users s ON o.seller_id = s.id
       WHERE o.buyer_id = ? OR o.seller_id = ?
       ORDER BY o.created_at DESC`,
      [userId, userId]
    );
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createMiddlemanOrder,
  getOrderDetails,
  getOrderMessages,
  sendOrderMessage,
  completeMiddlemanOrder,
  cancelMiddlemanOrder,
  getMyOrders
};
