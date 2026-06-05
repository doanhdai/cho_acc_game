
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS account_skins;
DROP TABLE IF EXISTS skins;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS deposit_requests;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Bảng users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(100),
  avatar VARCHAR(255),
  phone_zalo VARCHAR(20) NOT NULL,
  balance DECIMAL(15,0) DEFAULT 0,
  frozen_balance DECIMAL(15,0) DEFAULT 0,
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('active', 'banned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Bảng categories
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  image VARCHAR(255),
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Bảng accounts (game_accounts trong PRD)
CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15,0) NOT NULL,
  original_price DECIMAL(15,0),
  username VARCHAR(100),
  password VARCHAR(100),
  email_acc VARCHAR(100),
  email_pass VARCHAR(100),
  server VARCHAR(50),
  level INT,
  rank_level VARCHAR(50),
  champions_count INT DEFAULT 0,
  skins_count INT DEFAULT 0,
  security_status ENUM('TRANG_THONG_THIN', 'DINH_THONG_THIN') DEFAULT 'TRANG_THONG_THIN',
  status ENUM('SHOWING', 'IN_TRANSACTION', 'SOLD', 'HIDDEN') DEFAULT 'SHOWING',
  images JSON,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 4. Bảng skins
CREATE TABLE skins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  champion_name VARCHAR(100) NOT NULL,
  skin_name VARCHAR(100) NOT NULL,
  image_url VARCHAR(255) NOT NULL
);

-- 5. Bảng trung gian account_skins
CREATE TABLE account_skins (
  account_id INT NOT NULL,
  skin_id INT NOT NULL,
  PRIMARY KEY (account_id, skin_id),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (skin_id) REFERENCES skins(id) ON DELETE CASCADE
);

-- 6. Bảng orders (giao dịch trung gian)
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  account_id INT NOT NULL,
  amount DECIMAL(15,0) NOT NULL,
  fee DECIMAL(15,0) DEFAULT 0,
  status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  cancel_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- 7. Bảng messages (phòng chat 3 bên)
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Bảng transactions (lịch sử ví tiền)
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(15,0) NOT NULL,
  type ENUM('DEPOSIT', 'POST_FEE', 'MIDDLEMAN_HOLD', 'MIDDLEMAN_RELEASE', 'REFUND') NOT NULL,
  balance_before DECIMAL(15,0) NOT NULL,
  balance_after DECIMAL(15,0) NOT NULL,
  description TEXT,
  reference_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Bảng deposit_requests
CREATE TABLE deposit_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(15,0) NOT NULL,
  method VARCHAR(50) DEFAULT 'bank_transfer',
  transaction_ref VARCHAR(100),
  note TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_note TEXT,
  processed_by INT,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed dữ liệu mẫu
-- Mật khẩu hash cho 'admin123' là '$2b$10$pEwT17fEw21u9Fw6UvT1UeH1.8wVmWgK7u2ZkYp2B.nZ0Wc64aG'
INSERT INTO users (username, password, email, full_name, phone_zalo, balance, role) VALUES
('admin', '$2b$10$pEwT17fEw21u9Fw6UvT1UeH1.8wVmWgK7u2ZkYp2B.nZ0Wc64aG', 'admin@shop.com', 'Admin Shop', '0999999999', 10000000, 'admin'),
('user01', '$2b$10$pEwT17fEw21u9Fw6UvT1UeH1.8wVmWgK7u2ZkYp2B.nZ0Wc64aG', 'user01@gmail.com', 'Nguyễn Văn A', '0912345678', 500000, 'user'),
('seller01', '$2b$10$pEwT17fEw21u9Fw6UvT1UeH1.8wVmWgK7u2ZkYp2B.nZ0Wc64aG', 'seller01@gmail.com', 'Trần Văn B', '0987654321', 100000, 'user');

INSERT INTO categories (name, slug, image, description, display_order) VALUES 
('Liên Quân Mobile', 'lien-quan-mobile', '/lienquan.png', 'Mua bán acc Liên Quân Mobile uy tín, giá rẻ.', 1),
('Free Fire', 'free-fire', '/freefire.png', 'Shop acc Free Fire giá rẻ, an toàn.', 2),
('PUBG Mobile', 'pubg-mobile', '/pubg.png', 'Acc PUBG Mobile cực phẩm, đa dạng.', 3),
('LMHT', 'lien-minh-huyen-thoai', '/lmht.png', 'Tài khoản Liên Minh Huyền Thoại uy tín.', 4);

-- Seed danh sách skins Liên Quân Mobile
INSERT INTO skins (champion_name, skin_name, image_url) VALUES
('Violet', 'Pháo hoa tuôn trào', 'https://placehold.co/400x300/e91e63/ffffff?text=Violet+PHTT'),
('Violet', 'Thứ Nguyên Vệ Thần', 'https://placehold.co/400x300/3f51b5/ffffff?text=Violet+TNVT'),
('Nakroth', 'Thứ Nguyên Vệ Thần', 'https://placehold.co/400x300/00bcd4/ffffff?text=Nakroth+TNVT'),
('Nakroth', 'Lôi Quang Sứ', 'https://placehold.co/400x300/ffeb3b/000000?text=Nakroth+LQS'),
('Valhein', 'Vũ điệu đón xuân', 'https://placehold.co/400x300/4caf50/ffffff?text=Valhein+VDDX'),
('Valhein', 'Mũi tên mặt trời', 'https://placehold.co/400x300/ff5722/ffffff?text=Valhein+MTMT');

-- Seed tài khoản mẫu
INSERT INTO accounts (seller_id, category_id, title, description, price, original_price, username, password, email_acc, rank_level, champions_count, skins_count, security_status, status, images, is_featured) VALUES
(3, 1, 'Acc Liên Quân Siêu Cực Phẩm - Nakroth TNVT + Violet PHTT', 'Tài khoản tâm huyết đầy đủ skin VIP Thứ Nguyên Vệ Thần của Nakroth và Violet Pháo hoa tuôn trào. Có fix nhẹ xăng xe.', 650000, 800000, 'lq_sieucaptraitim', 'passgarena123', 'sieucapgarena@gmail.com', 'Cao Thủ', 95, 142, 'TRANG_THONG_THIN', 'SHOWING', '["https://placehold.co/800x450/13132a/6c63ff?text=Skin+Nakroth+TNVT", "https://placehold.co/800x450/13132a/e91e63?text=Skin+Violet+PHTT"]', TRUE),
(3, 1, 'Acc Liên Quân giá rẻ học sinh - Valhein Vũ điệu đón xuân', 'Phù hợp cho anh em cày cuốc, rank Kim Cương.', 150000, 200000, 'lq_hocsinh2004', 'passgarena456', NULL, 'Kim Cương', 45, 32, 'DINH_THONG_THIN', 'SHOWING', '["https://placehold.co/800x450/13132a/4caf50?text=Valhein+VDDX"]', FALSE),
(2, 2, 'Acc Free Fire Vip full MP40 Mãng Xà', 'Cực phẩm Free Fire rank Tinh Anh.', 450000, 500000, 'ff_sieucapvip', 'ffpass123', NULL, 'Tinh Anh', 40, 85, 'TRANG_THONG_THIN', 'SHOWING', '[]', TRUE);

-- Gắn skin cho acc 1 (Violet PHTT, Violet TNVT, Nakroth TNVT)
INSERT INTO account_skins (account_id, skin_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 5);
