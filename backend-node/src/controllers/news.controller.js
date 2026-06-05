const pool = require('../config/db');

const getNews = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    let where = ['n.is_published = 1'];
    const params = [];
    if (category) { where.push('n.category = ?'); params.push(category); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereStr = 'WHERE ' + where.join(' AND ');
    const [news] = await pool.query(
      `SELECT n.id, n.title, n.slug, n.excerpt, n.thumbnail, n.category, n.view_count, n.created_at, u.username AS author
       FROM news n LEFT JOIN users u ON n.author_id = u.id ${whereStr} ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM news n ${whereStr}`, params);
    res.json({ success: true, data: news, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getNewsDetail = async (req, res) => {
  try {
    const [news] = await pool.query(
      `SELECT n.*, u.username AS author FROM news n LEFT JOIN users u ON n.author_id = u.id
       WHERE n.slug = ? AND n.is_published = 1`,
      [req.params.slug]
    );
    if (news.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    await pool.query('UPDATE news SET view_count = view_count + 1 WHERE id = ?', [news[0].id]);
    res.json({ success: true, data: news[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTopDeposit = async (req, res) => {
  try {
    const [top] = await pool.query(
      `SELECT id, username, full_name, avatar, total_deposited FROM users
       WHERE role = 'user' ORDER BY total_deposited DESC LIMIT 20`
    );
    res.json({ success: true, data: top });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getNews, getNewsDetail, getTopDeposit };
