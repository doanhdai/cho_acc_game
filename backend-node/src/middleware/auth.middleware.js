const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (req._optionalAuth) {
      req.user = null;
      return next();
    }
    return res.status(401).json({ success: false, message: 'Không có token xác thực' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (req._optionalAuth) {
      req.user = null;
      return next();
    }
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }
    next();
  });
};

module.exports = { auth, adminAuth };
