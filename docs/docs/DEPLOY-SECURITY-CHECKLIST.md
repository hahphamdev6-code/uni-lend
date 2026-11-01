# Checklist Bảo Mật & Biến Môi Trường Triển Khai (Uni-Lend v1.0)

Tài liệu này tổng hợp danh sách các biến môi trường bắt buộc/tùy chọn và danh mục kiểm tra an toàn trước khi triển khai hệ thống Uni-Lend lên môi trường Staging / Production.

---

## 1. Danh sách Biến Môi Trường (Environment Variables)

### 1.1. Backend (`backend/.env`)

| Biến môi trường | Bắt buộc | Giá trị mặc định (Local) | Mô tả & Yêu cầu bảo mật ở Production |
| :--- | :---: | :--- | :--- |
| `MYSQL_DATABASE` | Có | `uni_lend` | Tên cơ sở dữ liệu MySQL 8.4. |
| `DB_URL` | Có | `jdbc:mysql://localhost:3306/uni_lend` | JDBC URL kết nối tới MySQL container hoặc managed DB. |
| `DB_USERNAME` | Có | `unilend` | Không sử dụng tài khoản `root` cho ứng dụng backend. |
| `DB_PASSWORD` | **Bắt buộc** | *(Không có)* | Mật khẩu mạnh tối thiểu 16 ký tự, không commit vào Git. |
| `MYSQL_ROOT_PASSWORD` | **Bắt buộc** | *(Không có)* | Mật khẩu root của MySQL container, khác với `DB_PASSWORD`. |
| `JWT_SECRET` | **Bắt buộc** | *(Không có)* | Chuỗi Base64 tối thiểu 32 bytes (sinh bằng `openssl rand -base64 32`). |
| `JWT_ISSUER` | Không | `http://unilend.local` | Định danh đơn vị phát hành token (đặt theo domain thật). |
| `JWT_EXPIRATION_MS` | Không | `86400000` (24h) | Thời gian sống của JWT access token (tính bằng mili-giây). |
| `CORS_ALLOWED_ORIGINS` | **Bắt buộc** | `http://localhost:3000` | Chỉ liệt kê domain chính thức của Frontend (không dùng `*`). |
| `FRONTEND_URL` | **Bắt buộc** | `http://localhost:3000` | URL Frontend dùng để tạo link xác minh email và đặt lại mật khẩu. |
| `UPLOAD_DIR` | Không | `uploads` (`/app/uploads`) | Thư mục lưu trữ ảnh món đồ, gắn với Docker volume bền vững. |
| `SWAGGER_ENABLED` | **Bắt buộc** | `true` | **Phải đặt là `false` trên Production** để đóng `/swagger-ui/**` và `/v3/api-docs/**`. |
| `MAIL_ENABLED` | Không | `false` | Đặt `true` trên Production khi đã cấu hình SMTP server. |
| `MAIL_FROM` | Không | `no-reply@unilend.local` | Địa chỉ email người gửi hiển thị trong thư xác minh/reset mật khẩu. |
| `SMTP_HOST` / `SMTP_PORT` | Khi bật mail | `localhost` / `1025` | Máy chủ và cổng SMTP. |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | Khi bật mail | *(Trống)* | Thông tin xác thực SMTP (lấy từ biến môi trường bảo mật). |
| `SMTP_AUTH` / `SMTP_STARTTLS` | Khi bật mail | `false` / `false` | Đặt `true` khi kết nối tới SMTP thực tế (Gmail, SES, SendGrid...). |
| `VERIFY_EMAIL_TTL_MINUTES` | Không | `1440` (24 giờ) | Thời hạn hiệu lực của token xác minh email. |
| `RESET_PASSWORD_TTL_MINUTES` | Không | `15` (15 phút) | Thời hạn hiệu lực của token đặt lại mật khẩu (chỉ dùng 1 lần). |
| `RATE_LIMIT_LOGIN_MAX` | Không | `5` | Số lần thử đăng nhập tối đa trong một cửa sổ thời gian. |
| `RATE_LIMIT_LOGIN_WINDOW_SECONDS` | Không | `60` | Cửa sổ thời gian giới hạn đăng nhập (giây). |
| `RATE_LIMIT_EMAIL_MAX` | Không | `3` | Số lần yêu cầu gửi email tối đa (register, resend, forgot-password). |
| `RATE_LIMIT_EMAIL_WINDOW_SECONDS` | Không | `900` (15 phút) | Cửa sổ thời gian giới hạn gửi email (giây). |

### 1.2. Frontend (`frontend/.env.local`)

| Biến môi trường | Bắt buộc | Giá trị mẫu | Mô tả |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | **Bắt buộc** | `https://api.unilend.example.com` | Địa chỉ kết nối tới Backend API. |

---

## 2. Checklist An Toàn Trước Khi Phát Hành (Pre-Release Security Checklist)

### 2.1. Quản lý Bí mật & Cấu hình (Secrets & Configuration)
- [ ] Không có file `.env`, mật khẩu DB, `JWT_SECRET` hoặc `SMTP_PASSWORD` nào nằm trong lịch sử Git (`git status --ignored`).
- [ ] `JWT_SECRET` trên môi trường Production được sinh ngẫu nhiên tối thiểu 256-bit (`openssl rand -base64 32`) và khác hoàn toàn với khóa dùng trong Unit Test.
- [ ] `SWAGGER_ENABLED=false` được thiết lập trên môi trường Production để vô hiệu hóa cả giao diện Swagger UI lẫn tài liệu `/v3/api-docs`.
- [ ] `CORS_ALLOWED_ORIGINS` chỉ chứa đúng tên miền HTTPS của Frontend, không mở wildcard (`*`).

### 2.2. Cơ sở dữ liệu & Flyway Migration
- [ ] `spring.jpa.hibernate.ddl-auto=validate` được bật cố định; mọi thay đổi cấu trúc bảng phải đi qua Flyway (`db/migration/mysql`).
- [ ] `spring.flyway.clean-disabled=true` và `spring.flyway.baseline-on-migrate=false` được giữ nguyên để ngăn xóa nhầm hoặc ghi đè lịch sử schema.
- [ ] Đã sao lưu (Backup) cơ sở dữ liệu MySQL và thư mục `uploads` trước khi chạy bản cập nhật mới.

### 2.3. Xác thực, Phân quyền & Phiên đăng nhập (Auth & Access Control)
- [ ] Mật khẩu người dùng được băm bằng `BCryptPasswordEncoder` (độ dài kiểm tra từ 8 đến 72 ký tự).
- [ ] Token xác minh email và đặt lại mật khẩu chỉ lưu bản băm `SHA-256` trong bảng `account_tokens`, tự động hết hạn và chỉ tiêu thụ được 1 lần duy nhất.
- [ ] Khi người dùng đổi mật khẩu, đặt lại mật khẩu hoặc bị Admin khóa/mở khóa, trường `token_version` tăng lên 1 để vô hiệu hóa tức thì mọi JWT cũ.
- [ ] Các API `/api/admin/**` được bảo vệ kép ở cả `SecurityConfig` (`hasRole("ADMIN")`) và tầng Service (`currentUserService.requireAdmin()`).
- [ ] API xem hồ sơ người dùng khác (`GET /api/users/{id}`) đã ẩn các trường nhạy cảm (`email`, `phone`, `roles`) đối với người xem không phải chính chủ hoặc Admin.

### 2.4. Bảo vệ Upload File & Chống lạm dụng (Upload & Rate Limiting)
- [ ] Giới hạn kích thước multipart được áp dụng ở mức Servlet (`max-file-size: 5MB`, `max-request-size: 26MB`) và tối đa 5 ảnh/món đồ.
- [ ] `ImageUploadValidator` kiểm tra chữ ký byte thật (Magic Bytes) của PNG/JPEG/WebP, giải mã và mã hóa lại ảnh để loại bỏ mã độc/metadata ẩn, lưu tên file bằng UUID và chống Path Traversal khi xóa file.
- [ ] Giới hạn tần suất (Rate Limiting) hoạt động cho đăng nhập (`5 lần / 60s`) và gửi email (`3 lần / 900s`), trả về `429 TOO_MANY_REQUESTS`.
- [ ] `GlobalExceptionHandler` chuẩn hóa mọi phản hồi lỗi về cấu trúc `ApiResponse`, không làm lộ Stack Trace, câu lệnh SQL hay thông tin máy chủ nội bộ.