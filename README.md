# Chợ Acc Game - Sàn Giao Dịch Tài Khoản Liên Quân C2C

Dự án Hệ thống cửa hàng và sàn giao dịch mua bán tài khoản game Liên Quân Mobile theo mô hình C2C (Consumer-to-Consumer), cho phép người dùng tự đăng tin bán tài khoản, giao dịch an toàn qua hệ thống ký quỹ (Escrow) trung gian do Quản Trị Viên kiểm duyệt.

---

## 🏗️ Kiến Trúc Hệ Thống

Dự án được thiết kế theo mô hình client-server hiện đại tách biệt hoàn toàn giữa Frontend và Backend:

*   **Backend:** Spring Boot (Java), Spring Security, JPA Hibernate, JWT Authentication, MySQL, Cloudflare R2 (lưu trữ hình ảnh).
*   **Frontend:** ReactJS (Vite), Axios để kết nối API, React Router, React Hot Toast, React Icons.
*   **Lưu trữ hình ảnh:** Cloudflare R2 API tương thích AWS S3 SDK giúp lưu trữ hình ảnh tài khoản game tốc độ cao, chi phí tối ưu.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
Shop_acc_game/
├── backend/               # Mã nguồn máy chủ Spring Boot
│   ├── src/               # Java source code & application configurations
│   ├── database/          # File schema.sql khởi tạo cơ sở dữ liệu
│   ├── pom.xml            # Quản lý thư viện Maven
│   └── .env.example       # File ví dụ cấu hình môi trường backend
├── frontend/              # Mã nguồn giao diện ReactJS
│   ├── src/               # Component, Page, API Client, Context
│   ├── public/            # Asset tĩnh (Logo, Banner...)
│   ├── package.json       # Thư viện npm
│   └── .env.example       # File ví dụ cấu hình môi trường frontend
└── README.md              # Hướng dẫn này
```

---

## ⚙️ Hướng Dẫn Cấu Hình Môi Trường

### 1. Khởi Tạo Cơ Sở Dữ Liệu
Hệ thống sử dụng cơ sở dữ liệu MySQL. Bạn cần tạo một cơ sở dữ liệu mới và import schema:
1. Tạo database trên MySQL:
   ```sql
   CREATE DATABASE shop_acc_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Import file SQL cấu trúc bảng tại đường dẫn: `backend/database/schema.sql`

### 2. Cấu hình Backend
Tạo một file `.env` nằm trong thư mục `backend/` dựa trên nội dung file `backend/.env.example` và cấu hình các giá trị thực tế của bạn:

```env
# --- Database configuration ---
SPRING_DATASOURCE_URL=jdbc:mysql://127.0.0.1:3306/shop_acc_game?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=

# --- Security & Auth ---
JWT_SECRET=your_jwt_secret_key_here

# --- Cloudflare R2 Storage (Lưu trữ ảnh) ---
R2_ACCOUNT_ID=your_cloudflare_r2_account_id
R2_API_TOKEN=your_cloudflare_r2_api_token
R2_BUCKET_NAME=your_r2_bucket_name
R2_PUBLIC_URL=your_r2_public_access_url
```

### 3. Cấu hình Frontend
Tạo một file `.env` nằm trong thư mục `frontend/` dựa trên nội dung file `frontend/.env.example`:

```env
# URL kết nối tới API của Backend
VITE_API_URL=http://localhost:8080/api

# Cấu hình Tên & Logo ứng dụng
VITE_SITE_NAME=Chợ Acc Liên quân
VITE_LOGO_URL=/logo_lienquan.png
```

---

## 🚀 Hướng Dẫn Chạy Dưới Local (Development)

### Khởi chạy Backend:
1. Mở thư mục `backend` bằng IDE của bạn (IntelliJ IDEA, Eclipse, VS Code).
2. Chạy ứng dụng từ class chính `com.shopaccgame.ShopAccGameApplication`.
3. Hoặc chạy trực tiếp bằng dòng lệnh:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *Lưu ý:* Backend sẽ chạy trên cổng mặc định `8080`.

### Khởi chạy Frontend:
1. Mở cửa sổ terminal tại thư mục `frontend`.
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Chạy môi trường phát triển:
   ```bash
   npm run dev
   ```
4. Truy cập giao diện tại địa chỉ được hiển thị trên console (mặc định: `http://localhost:5173`).

---

## 📦 Hướng Dẫn Đóng Gói Và Triển Khai (Deployment)

Khi chuẩn bị đưa hệ thống lên máy chủ chính thức (Production), thực hiện đóng gói theo các bước sau:

### 1. Đóng gói Backend (Spring Boot JAR)
Chạy lệnh đóng gói Maven trong thư mục `backend`:
```bash
cd backend
mvn clean package -DskipTests
```
Sau khi chạy thành công, file JAR chạy trực tiếp sẽ được sinh ra tại: `backend/target/shop-acc-game-backend-1.0.0.jar`.

Để chạy ứng dụng trên máy chủ production:
```bash
java -jar shop-acc-game-backend-1.0.0.jar
```
*Mẹo:* Bạn có thể định cấu hình các biến môi trường trực tiếp trên OS hoặc file `.env` cùng thư mục để ghi đè các cấu hình mặc định một cách an toàn.

### 2. Đóng gói Frontend (React Production Build)
Chạy lệnh build trong thư mục `frontend`:
```bash
cd frontend
npm run build
```
Lệnh này sẽ biên dịch, tối ưu dung lượng và xuất ra thư mục tĩnh `frontend/dist/`. 
*   Bạn chỉ cần đưa toàn bộ file trong thư mục `dist/` này lên hosting tĩnh (như Vercel, Netlify, Cloudflare Pages) hoặc cấu hình Nginx để phục vụ các file này.
*   Cấu hình Nginx reverse proxy cơ bản để chuyển các request `/api` sang cổng `8080` của Spring Boot Backend.
