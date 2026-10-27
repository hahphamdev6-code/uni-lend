# Hướng dẫn kiểm thử backend Uni-Lend

Tài liệu này hướng dẫn chạy bộ kiểm thử tự động và kiểm tra API thủ công. API chạy tại `http://localhost:8080`; danh sách endpoint đầy đủ nằm trong [`../../docs/API-FRONTEND.md`](../../docs/API-FRONTEND.md).

## 1. Chạy kiểm thử tự động

Yêu cầu: JDK 25 (theo `backend/pom.xml`) và PowerShell trên Windows. Các bài test dùng H2 trong bộ nhớ; không cần bật MySQL hay tạo `backend/.env`.

Mở PowerShell tại thư mục `backend`:

```powershell
.\mvnw.cmd test
```

Chạy riêng một lớp test:

```powershell
.\mvnw.cmd -Dtest=AuthAndLoanIntegrationTest test
.\mvnw.cmd -Dtest=ItemServiceUploadTest test
```

Kết quả tổng hợp được Maven in ở cuối lệnh. Báo cáo chi tiết nằm trong `backend/target/surefire-reports/` (`.txt` và `.xml`). Nếu build lỗi, kiểm tra phiên bản Java bằng `java -version` và đảm bảo Maven Wrapper tải được dependency.

Một số nhóm đã có trong bộ test:

| Nhóm | Lớp test tiêu biểu |
|---|---|
| Đăng ký, đăng nhập, JWT và luồng vay | `AuthAndLoanIntegrationTest`, `AuthServiceTest`, `AccountTokenServiceTest`, `LoanRequestServiceTest` |
| Upload ảnh | `ItemServiceUploadTest`, `ImageUploadValidatorTest` |
| Người dùng, quản trị, thống kê | `UserServiceTest`, `AdminUserServiceTest`, `AdminStatsServiceTest` |
| Thông báo, email, giới hạn yêu cầu | `NotificationServiceTest`, `EmailServiceTest`, `RateLimitServiceTest` |
| Review, lịch quá hạn, migration | `ReviewServiceTest`, `LoanOverdueSchedulerTest`, `DatabaseMigrationTest`, `MigrationContextTest` |

## 2. Khởi động API để kiểm tra thủ công

Từ `backend`, tạo file cấu hình local nếu chưa có:

```powershell
Copy-Item .env.example .env
```

Điền thông tin MySQL và `JWT_SECRET` hợp lệ trong `.env`. Có thể dùng Docker Compose để bật MySQL cùng backend:

```powershell
docker compose up --build
```

Hoặc bật MySQL riêng rồi chạy API:

```powershell
.\mvnw.cmd spring-boot:run
```

Đợi log báo ứng dụng đã khởi động. Mở Swagger tại `http://localhost:8080/swagger-ui/index.html`; OpenAPI JSON ở `http://localhost:8080/v3/api-docs`. Flyway tự áp dụng migration khi backend kết nối database lần đầu.

## 3. Kiểm tra nhanh bằng Swagger hoặc Postman

1. Gọi `POST /api/auth/register` với JSON, ví dụ:

   ```json
   {"email":"borrower@example.com","password":"password123","fullName":"Borrower Test"}
   ```

   Ghi lại `data.token` trong phản hồi. Đăng ký có thể trả `409` nếu email đã tồn tại; dùng một email mới hoặc đăng nhập bằng tài khoản hiện có.

2. Trong Swagger bấm **Authorize**, nhập token (hoặc `Bearer <token>` nếu ô nhập yêu cầu tiền tố), rồi xác nhận. Với Postman đặt header `Authorization: Bearer <token>` cho request cần đăng nhập.

3. Đăng nhập lần nữa qua `POST /api/auth/login` để kiểm tra thông tin đăng nhập. Gọi `GET /api/users/me` để xác nhận token hoạt động.

4. Thử một số API công khai: `GET /api/categories` và `GET /api/items`. Gửi `GET /api/notifications` khi chưa xác thực để xác nhận API bảo vệ trả `401`.

5. Tạo một mặt hàng bằng `POST /api/items` (đã xác thực), rồi tải danh sách bằng `GET /api/items/me`. Dùng item ID nhận được để gửi yêu cầu mượn bằng `POST /api/loan-requests` với ngày bắt đầu và ngày đến hạn hợp lệ.

6. Để kiểm tra duyệt/trả yêu cầu, đăng nhập bằng tài khoản chủ sở hữu mặt hàng, xem `GET /api/loan-requests/incoming`, rồi gọi `PATCH /api/loan-requests/{id}/approve`. Sau khi được duyệt, chủ sở hữu có thể xác nhận trả bằng `PATCH /api/loan-requests/{id}/return`.

7. Kiểm tra thông báo bằng `GET /api/notifications` và `GET /api/notifications/unread-count`; đánh dấu đã đọc bằng `PATCH /api/notifications/{id}/read`.

## 4. Các trường hợp nên xác nhận

- Request hợp lệ trả mã `2xx`, `success: true` và dữ liệu nằm trong `data`.
- Thiếu token hoặc token sai/hết hạn: endpoint cần đăng nhập trả `401`.
- Người dùng thường gọi API quản trị hoặc sửa tài nguyên của người khác: bị từ chối (`403` hoặc mã lỗi nghiệp vụ tương ứng).
- Dữ liệu sai định dạng/vi phạm validation: trả lỗi có thông tin trường; email trùng hoặc trạng thái nghiệp vụ không hợp lệ trả lỗi phù hợp.
- Danh sách phân trang có `content`, `page`, `size`, `totalElements`, `totalPages`, `last` trong `data`.
- Upload ảnh: thử JPG, PNG, WebP hợp lệ; kiểm tra GIF không được chấp nhận. Chỉ thử trên dữ liệu local.
- Đổi mật khẩu hoặc đặt lại mật khẩu làm token cũ mất hiệu lực; đăng nhập lại để lấy token mới.

## Lưu ý khi test

- Đăng ký tạo tài khoản chưa xác minh email; email gửi ra ngoài mặc định tắt (`MAIL_ENABLED=false`). Đăng nhập vẫn có thể dùng để kiểm tra các luồng cơ bản, nhưng để kiểm tra xác minh email cần bật SMTP và lấy token từ thư nhận được.
- Login và yêu cầu email có rate limit. Nếu gặp `429`, chờ hết cửa sổ giới hạn cấu hình trong `.env` rồi thử lại.
- Dữ liệu thủ công được lưu trong MySQL. Chọn email và dữ liệu test riêng để tránh ghi đè dữ liệu cần giữ.
- Một số endpoint hỗ trợ nhiều alias như `/api/...`, `/api/v1/...` và đường dẫn không tiền tố; dùng đúng path được Swagger/OpenAPI liệt kê.
