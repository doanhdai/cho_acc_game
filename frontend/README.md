TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD)
Tên dự án: Chợ Tài Khoản Liên Quân Mobile (C2C Marketplace)
Mô hình: Lai giữa Rao vặt thu phí đăng tin (giống Chợ Tốt) và Sàn giao dịch ký quỹ có Admin làm trung gian an toàn.

1. TỔNG QUAN HỆ THỐNG & LUỒNG NGHIỆP VỤ CHÍNH (FLOW)
Hệ thống hoạt động dựa trên 3 thực thể chính: Người bán (Seller), Người mua (Buyer), và Admin (Trọng tài/Trung gian). Web KHÔNG lưu trữ tài khoản/mật khẩu game của người dùng để đảm bảo an toàn tuyệt đối.

1.1 Luồng của Người bán (Seller Flow)
Đăng ký/Đăng nhập tài khoản → Cập nhật số điện thoại Zalo trong hồ sơ.

Nạp tiền vào Ví điện tử trên sàn (qua VietQR/MoMo tự động).

Tạo tin đăng bán acc: Nhập thông số game, đính kèm ảnh kho đồ, chọn danh sách Skin nổi bật, chọn trạng thái thông tin (Trắng/Dính thông tin). Không nhập mật khẩu game.

Bấm đăng tin → Hệ thống trừ 5.000đ trong ví → Tin hiển thị công khai trên chợ.

1.2 Luồng của Người mua (Buyer Flow)
Vào chợ → Sử dụng bộ lọc nâng cao (lọc theo tướng, tìm theo tên skin, rank, khoảng giá) để tìm acc ưng ý.

Click vào trang chi tiết acc để xem hình ảnh và thông số.

Hệ thống cung cấp 2 lựa chọn giao dịch:

Lựa chọn 1 - Tự liên hệ Zalo: Người mua click nút, hệ thống chuyển hướng thẳng sang chat Zalo với người bán. Hai bên tự chịu rủi ro chuyển tiền/giao acc ngoài đời. Sàn không thu thêm phí.

Lựa chọn 2 - Giao dịch qua Admin trung gian: Người mua nạp tiền vào ví bằng giá trị acc → Bấm nút mua → Hệ thống khóa (Hold) số tiền đó lại và kích hoạt phòng chat 3 bên để Admin xử lý đổi acc an toàn.

2. MÔ TẢ CHI TIẾT CHỨC NĂNG (STEP-BY-STEP)
CHỨC NĂNG 1: QUẢN LÝ TÀI KHOẢN & VÍ TIỀN (USER & WALLET)
Khách vãng lai (Chưa đăng nhập):
Bước 1: Click nút "Đăng nhập".

Bước 2: Chọn Đăng nhập bằng tài khoản/mật khẩu thông thường hoặc bấm "Đăng nhập với Google" để bypass qua nhanh.

Bước 3: Ở lần đăng nhập đầu tiên, hệ thống ép người dùng cập nhật thông tin cá nhân gồm: Họ tên, Số điện thoại (dùng làm link Zalo).

Phân hệ Ví tiền (Wallet):
Bước 1: User vào mục "Nạp tiền". Hệ thống hiển thị mã VietQR động (chứa nội dung chuyển khoản định danh dạng NAP_USER123) kèm số tiền muốn nạp.

Bước 2: User quét mã bằng app Ngân hàng và chuyển tiền.

Bước 3 (Backend xử lý): Cổng thanh toán bắn Webhook về Server → Backend kiểm tra đúng cú pháp NAP_USER123 → Tự động cộng số dư vào trường balance của user và bắn thông báo Realtime lên màn hình web.

Bước 4: Mục "Lịch sử ví" hiển thị danh sách biến động số dư: Ngày giờ, Số tiền, Nội dung (Nạp tiền, Phí đăng tin, Tiền bán acc, Phí trung gian).

CHỨC NĂNG 2: QUẢN LÝ ĐĂNG TIN (DÀNH CHO NGƯỜI BÁN)
Bước 1: Người bán bấm nút "Đăng tin bán acc".

Bước 2: Điền thông tin cơ bản: Nhập tiêu đề bài đăng, giá bán mong muốn, mô tả chi tiết.

Bước 3: Chọn thông số game:

Dropdown chọn mức Rank hiện tại (Đồng, Bạc, Vàng ... Cao Thủ, Thách Đấu).

Ô nhập số lượng tướng, số lượng trang phục hiện có.

Bước 4: Chọn trang phục (Skin) nổi bật (Tính năng trực quan):

Người bán gõ tên Tướng (Ví dụ: "Nakroth") → Hiện ra danh sách các Skin của Nakroth dưới dạng ảnh nhỏ + Tên skin.

Người bán tích chọn các skin đặc biệt có trong acc (Ví dụ: Nakroth Thứ Nguyên Vệ Thần). Các skin này sẽ lưu vào DB để phục vụ bộ lọc của người mua.

Bước 5: Upload hình ảnh: Người bán kéo thả tối đa 10 ảnh chụp kho đồ, bảng ngọc trong game lên giao diện. (Hệ thống đẩy ảnh lên Cloud Storage như AWS S3).

Bước 6: Chọn trạng thái bảo mật: Tích chọn Trắng thông tin hoặc Dính thông tin (SĐT/Gmail).

Bước 7: Thanh toán phí treo bài:

Người bán bấm "Hoàn tất & Đăng tin".

Hệ thống gọi API kiểm tra số dư:

Nếu balance < 5.000đ: Hiện thông báo "Số dư không đủ, vui lòng nạp thêm tiền".

Nếu balance ≥ 5.000đ: Trừ 5.000đ → Ghi log giao dịch → Đổi trạng thái bài đăng thành SHOWING (Công khai).

CHỨC NĂNG 3: BỘ LỌC NÂNG CAO & TÌM KIẾM (DÀNH CHO NGƯỜI MUA)
Bước 1: Tại trang chủ, người mua thấy thanh công cụ Tìm kiếm/Lọc.

Bước 2: Thực hiện lọc nâng cao:

Lọc theo Khoảng giá (Ví dụ: Từ 100k đến 500k).

Lọc theo Rank (Ví dụ: Chỉ tìm acc Cao Thủ).

Lọc theo Skin cụ thể: Người mua bấm vào ô "Tìm theo Skin" → Chọn tướng Violet → Tích chọn skin Pháo hoa tuôn trào.

Bước 3 (Backend xử lý): Hệ thống nhận các tham số lọc, thực hiện câu lệnh SQL Query nối chuỗi (Join nhiều bảng) để tìm ra chính xác các ID acc thỏa mãn và trả về danh sách kèm tính năng phân trang (Pagination).

CHỨC NĂNG 4: LUỒNG GIAO DỊCH CHI TIẾT (XỬ LÝ STEP-BY-STEP)
Khi người mua nhấn vào một acc bất kỳ để xem chi tiết, giao diện sẽ show đầy đủ ảnh, thông số và hiển thị 2 Nút hành động:

Luồng 4.1: Nút "Liên hệ Zalo người bán" (Giao dịch tự do)
Bước 1: Người mua click nút "Liên hệ Zalo người bán".

Bước 2: Hệ thống mở ra một tab mới dẫn thẳng tới link: [https://zalo.me/](https://zalo.me/)[SĐT_Người_Bán].

Bước 3: Hệ thống hiển thị đồng thời một Popup cảnh báo trên web: "Bạn đang chuyển sang giao dịch tự do bên ngoài qua Zalo. Hãy yêu cầu người bán đổi thông tin trước khi chuyển tiền để tránh lừa đảo. Sàn không chịu trách nhiệm cho hình thức này."

Luồng 4.2: Nút "Mua qua Admin trung gian" (An toàn 100%)
Bước 1: Người mua click nút "Mua qua Admin trung gian".

Bước 2: Hệ thống kiểm tra số dư người mua: Nếu không đủ tiền, yêu cầu nạp thêm bằng đúng giá trị acc. Nếu đủ tiền, tiến hành khấu trừ số tiền đó từ balance và đẩy vào trường frozen_balance (Đóng băng tiền trên sàn).

Bước 3: Bài đăng đổi trạng thái sang IN_TRANSACTION (Tạm ẩn khỏi chợ, không cho người khác mua nữa).

Bước 4: Hệ thống khởi tạo một Mã đơn hàng trung gian và kích hoạt phòng chat trực tuyến Realtime (Sử dụng Socket.io hoặc Firebase) hiển thị ngay trên web của cả 3 bên: Người mua, Người bán, và Admin.

Bước 5: Quy trình xử lý tại Phòng Chat Trung Gian:

Sub-step 5.1: Admin nhắn tin yêu cầu Người bán gửi tài khoản và mật khẩu game vào phòng chat (Tin nhắn này có thể cấu hình ẩn chỉ Admin nhìn thấy).

Sub-step 5.2: Admin đăng nhập vào game/trang chủ Garena check đúng acc như mô tả trên web (Đủ tướng, đủ skin).

Sub-step 5.3: Admin nhắn mã OTP hoặc hỗ trợ gỡ thông tin cũ của người bán, sau đó bàn giao tài khoản/mật khẩu cho Người mua.

Sub-step 5.4: Người mua đăng nhập, tiến hành liên kết SĐT/Gmail mới của họ vào acc thành công.

Bước 6: Giải ngân & Kết thúc:

Sau khi người mua báo OK, Admin truy cập Dashboard Admin bấm nút "Xác nhận hoàn tất đơn hàng".

Hệ thống chuyển tiền từ frozen_balance của người mua sang balance của người bán (Ví dụ: Hệ thống tự động trừ đi 3% phí dịch vụ trung gian giữ lại cho admin, người bán nhận 97% giá tiền acc).

Bài đăng chuyển trạng thái vĩnh viễn sang SOLD (Đã bán). Kênh chat đóng lại.

CHỨC NĂNG 5: TRANG QUẢN TRỊ (ADMIN DASHBOARD)
Quản lý danh sách đơn trung gian: Nơi Admin nhìn thấy toàn bộ các ca mua bán đang chờ xử lý, click vào để tham gia phòng chat 3 bên với khách.

Quản lý tin đăng: Admin có quyền xóa, sửa các tin đăng có hình ảnh vi phạm pháp luật, ngôn từ thô tục hoặc tin giả.

Quản lý dòng tiền: Xem tổng doanh thu sàn kiếm được (Tổng tiền thu phí đăng tin 5.000đ + Tổng tiền phí dịch vụ trung gian tích lũy).

Quản lý Data Game: Menu cho phép Admin thêm Tướng mới hoặc cập nhật Skin mới kèm hình ảnh mỗi khi Garena ra mắt bản cập nhật game mới.

3. THIẾT KẾ CƠ SỞ DỮ LIỆU CỐT LÕI (DATABASE SCHEMAS)
Để Dev nhìn vào là code được ngay, cấu trúc DB được tối ưu như sau:

Bảng 1: users (Quản lý người dùng và ví tiền)
id (INT, Primary Key)

username / password / email

phone_zalo (VARCHAR - Bắt buộc để tạo link liên hệ Zalo)

balance (DECIMAL - Tiền khả dụng)

frozen_balance (DECIMAL - Tiền đang bị khóa khi mua trung gian)

role (VARCHAR - 'USER' hoặc 'ADMIN')

Bảng 2: game_accounts (Thông tin tin đăng bán acc)
id (INT, Primary Key)

seller_id (INT, Foreign Key nối với users.id)

title / description (TEXT)

price (DECIMAL)

rank_level (VARCHAR - Tình trạng rank)

champions_count / skins_count (INT)

security_status (VARCHAR - 'TRANG_THONG_TIN' hoặc 'DINH_THONG_TIN')

status (VARCHAR - 'SHOWING', 'IN_TRANSACTION', 'SOLD', 'HIDDEN')

Bảng 3: skins (Từ điển toàn bộ skin trong game do admin cấu hình sẵn)
id (INT, Primary Key)

champion_name (VARCHAR - Tên tướng, ví dụ: Valhein)

skin_name (VARCHAR - Tên skin, ví dụ: Vũ điệu đón xuân)

image_url (VARCHAR - Link ảnh skin lưu trên S3)

Bảng 4: account_skins (Bảng trung gian thể hiện acc nào có skin nào)
account_id (INT, Foreign Key nối với game_accounts.id)

skin_id (INT, Foreign Key nối với skins.id)

Primary Key là cặp (account_id, skin_id)

Bảng 5: transactions (Ghi lại lịch sử giao dịch tiền)
id (INT, Primary Key)

user_id (INT)

amount (DECIMAL - Số tiền cộng hoặc trừ)

type (VARCHAR - 'DEPOSIT' (nạp), 'POST_FEE' (phí 5k), 'MIDDLEMAN_HOLD', 'MIDDLEMAN_RELEASE')

created_at (TIMESTAMP)

Tiếp tục từ bản PRD ở trên, để hệ thống có thể vận hành mượt mà ngoài đời thực, chúng ta cần bổ sung các phân hệ về **Xử lý tranh chấp (Dispute)**, **Hệ thống Thông báo (Notification)**, **Quản lý ảnh (Media)**, và bộ **Quy tắc vận hành sàn (Platform Policies)**.

Dưới đây là phần tiếp theo và cũng là phần hoàn thiện toàn bộ tài liệu PRD step-by-step cho web của bạn:

---

### CHỨC NĂNG 6: HỆ THỐNG XỬ LÝ TRANH CHẤP / HỦY ĐƠN TRUNG GIAN (DISPUTE & CANCEL FLOW)

Trong quá trình Admin làm trung gian tại phòng chat 3 bên, sẽ có trường hợp giao dịch thất bại (ví dụ: Người bán đưa sai pass, acc không đúng như ảnh chụp, hoặc người bán đổi ý không muốn bán nữa).

#### Luồng Hủy Đơn & Hoàn Tiền (Cancel & Refund Step-by-Step):

* **Bước 1:** Tại phòng chat trung gian, nếu phát hiện lỗi từ phía người bán hoặc người mua yêu cầu hủy vì acc lỗi, Admin bấm nút **"Hủy đơn hàng"** trên thanh công cụ của Admin.
* **Bước 2:** Hệ thống hiển thị Popup yêu cầu Admin chọn lý do hủy: *`Acc sai thông tin mô tả`*, *`Người bán không cung cấp được tài khoản`*, *`Hai bên tự thỏa thuận hủy`*.
* **Bước 3 (Backend xử lý):** Sau khi Admin bấm xác nhận hủy:
* Hệ thống lấy số tiền đang bị khóa ở `frozen_balance` của Người mua chuyển ngược lại về `balance` (Số dư khả dụng) của Người mua.
* Hệ thống **KHÔNG** hoàn lại 5.000đ phí đăng tin cho người bán (để phạt lỗi đăng tin sai sự thật).
* Trạng thái bài đăng acc chuyển từ `IN_TRANSACTION` về `HIDDEN` (Ẩn hoàn toàn khỏi chợ) hoặc xóa hẳn tùy Admin chọn.
* Hệ thống tự động gửi tin nhắn thông báo vào phòng chat: *"Đơn hàng đã bị hủy bởi Admin. Tiền đã được hoàn trả vào ví người mua."* và đóng phòng chat sau 5 phút.



---

### CHỨC NĂNG 7: HỆ THỐNG THÔNG BÁO THỜI GIAN THỰC (REALTIME NOTIFICATION)

Để người dùng không phải ngồi canh website liên tục, hệ thống cần có bộ bắn thông báo (sử dụng Firebase Cloud Messaging hoặc Socket.io).

#### 7.1 Đối với Người bán:

* **Kịch bản 1:** Khi nạp tiền thành công $\rightarrow$ Bắn thông báo: *"Bạn đã nạp thành công [Số tiền]đ vào tài khoản."*
* **Kịch bản 2:** Khi có người bấm mua qua trung gian $\rightarrow$ Bắn thông báo kèm âm thanh chuông: *"Tài khoản mã #[ID_Acc] của bạn đã có người mua trung gian. Vui lòng vào phòng chat để phối hợp với Admin!"*

#### 7.2 Đối với Người mua:

* **Kịch bản 1:** Khi Admin tham gia vào phòng chat $\rightarrow$ Bắn thông báo: *"Admin [Tên_Admin] đã tham gia phòng chat đơn hàng #[ID_Đơn]. Quá trình giao dịch bắt đầu."*
* **Kịch bản 2:** Khi đơn hàng hoàn tất $\rightarrow$ Bắn thông báo: *"Giao dịch thành công! Cảm ơn bạn đã sử dụng dịch vụ trung gian an toàn."*

---

### CHỨC NĂNG 8: QUẢN LÝ MEDIA & UPLOAD ẢNH (MEDIA MANAGEMENT)

Vì người bán đăng rất nhiều ảnh chụp màn hình game (kho đồ, bảng ngọc, skin), nếu lưu trực tiếp vào server của bạn sẽ làm đầy ổ cứng rất nhanh và làm nghẽn băng thông web.

* **Luồng xử lý:**
* Khi user kéo thả ảnh vào ô đăng tin $\rightarrow$ Frontend sẽ nén ảnh lại (giảm dung lượng xuống dưới 1MB bằng thư viện JavaScript như `browser-image-compression`) để load web cho nhanh.
* Frontend/Backend đẩy thẳng file ảnh này lên **AWS S3** hoặc **Cloudinary** $\rightarrow$ Trả về một chuỗi URL (Link ảnh).
* Hệ thống lưu link URL này vào bảng `account_images` trong Database. Khi người mua vào xem, web chỉ cần gọi link ảnh này ra hiển thị.



---

## 4. CHI TIẾT CÁC CÂU LỆNH API CỐT LÕI (CORE API ENDPOINTS)

Dưới đây là danh sách các API mà Backend (Spring Boot / Laravel) của bạn cần phải viết để Frontend (Next.js) gọi:

### 4.1 API Ví & Người dùng:

* `POST /api/v1/auth/register` : Đăng ký tài khoản (Yêu cầu nhập tên, pass, SĐT Zalo).
* `POST /api/v1/wallet/callback` : Endpoint nhận dữ liệu (Webhook) từ ngân hàng/MoMo để tự động cộng tiền cho user khi họ quét mã VietQR.
* `GET /api/v1/wallet/history` : Lấy lịch sử biến động số dư ví của user hiện tại.

### 4.2 API Đăng tin & Bộ lọc:

* `GET /api/v1/champions` : Lấy danh sách toàn bộ tướng trong game (để hiện dropdown).
* `GET /api/v1/champions/{id}/skins` : Lấy danh sách skin của tướng cụ thể (có ảnh + tên).
* `POST /api/v1/accounts/create` : API Đăng tin bán acc (Xử lý check số dư $>=$ 5.000đ, trừ tiền, lưu thông số game, lưu các skin nổi bật được tích chọn).
* `POST /api/v1/accounts/search` : API tìm kiếm nâng cao (Nhận các tham số: `price_min`, `price_max`, `rank`, `skin_ids[]` $\rightarrow$ Trả về danh sách acc phù hợp).

### 4.3 API Giao dịch Trung gian:

* `POST /api/v1/orders/middleman/create` : Khởi tạo đơn hàng trung gian (Khóa tiền người mua, ẩn acc khỏi chợ, tạo phòng chat).
* `GET /api/v1/rooms/{room_id}/messages` : Lấy lịch sử tin nhắn trong phòng chat 3 bên.
* `POST /api/v1/orders/middleman/{order_id}/complete` : (Chỉ Admin gọi được) Xác nhận hoàn tất đơn, chuyển tiền đóng băng cho người bán (sau khi trừ phí sàn), đổi trạng thái acc sang `SOLD`.
* `POST /api/v1/orders/middleman/{order_id}/cancel` : (Chỉ Admin gọi được) Hủy đơn, trả lại tiền cho người mua.

---

## 5. CÁC QUY TẮC VÀ CHẾ TÀI VẬN HÀNH (PLATFORM POLICIES)

Để chợ game không biến thành "chợ rác" và tràn lan lừa đảo, bạn cần cài đặt sẵn các luật sau trong hệ thống:

1. **Luật Spam Đăng Tin:** Một tài khoản trong vòng 5 phút chỉ được đăng tối đa 2 bài viết (để tránh trường hợp tool bot tự động spam phá hoại hệ thống, làm cạn kiệt tài nguyên database).
2. **Luật Cập Nhật SĐT Zalo:** Người dùng bắt buộc phải xác thực số điện thoại hoặc cập nhật đúng định dạng SĐT Zalo thì nút "Đăng tin" và nút "Liên hệ Zalo" mới hoạt động. Nếu SĐT Zalo lỗi (không tồn tại), người mua có quyền bấm nút "Báo cáo tin giả" để Admin gỡ bài.
3. **Luật Khóa Tài Khoản Lừa Đảo:** Nếu Admin xử lý ca trung gian và phát hiện người bán cố tình đưa thông tin sai, block Admin, hoặc có hành vi lừa đảo $\rightarrow$ Admin có nút "Khóa tài khoản vĩnh viễn" $\rightarrow$ Toàn bộ số tiền còn lại trong ví của kẻ lừa đảo sẽ bị đóng băng vĩnh viễn không cho rút.

---

## TỔNG KẾT KẾ HOẠCH TRIỂN KHAI (ROADMAP)

Với tài liệu PRD này, bạn có thể chia dự án làm 2 giai đoạn (Sprints):

* **Tuần 1 (Sprint 1 - Core Web):** Làm giao diện (UI), Hệ thống Auth, Tính năng Nạp tiền tự động qua Ví, và tính năng Đăng tin bán acc (Thu phí 5.000đ).
* **Tuần 2 (Sprint 2 - Giao dịch & Bộ lọc):** Dựng DB cho Tướng/Skin, làm Bộ lọc tìm kiếm nâng cao, và code hệ thống Phòng Chat Realtime kèm các nút xử lý của Admin (Complete / Cancel).

Bản PRD này đã bao quát toàn bộ ngóc ngách tính năng (Step-by-Step) từ giao diện cho đến kiến trúc database. Bạn có thể bê nguyên bản thiết kế này gửi cho bên lập trình (hoặc tự mình bắt tay vào code) là hệ thống sẽ chạy cực kỳ chuẩn chỉ!