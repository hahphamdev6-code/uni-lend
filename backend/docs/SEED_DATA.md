# Dữ liệu mẫu cho dev và demo

Seed tạo hai tài khoản, ba danh mục và ba món đồ trong một giao dịch. Tính năng
mặc định tắt; chỉ tạo bean khi profile có dev hoặc demo, không có prod và
app.seed.enabled=true. Production không tạo seed ngay cả khi bật cờ hoặc chọn
đồng thời prod,dev. Không đưa seed vào migration hoặc dùng ddl-auto update.

## Dữ liệu

| Loại | Giá trị |
| --- | --- |
| ADMIN | admin.demo@unilend.test, quyền ADMIN và USER |
| Chủ đồ demo | student.demo@unilend.test, quyền USER |
| Danh mục | Sách giáo trình (Demo), Đồ học tập (Demo), Đồ điện tử (Demo) |
| Đồ mẫu | [DEMO] Giáo trình Java cơ bản, [DEMO] Máy tính cầm tay, [DEMO] Đèn bàn học |

Mật khẩu lấy từ SEED_ADMIN_PASSWORD và SEED_USER_PASSWORD, mỗi mật khẩu ít nhất
12 ký tự; không có mật khẩu mặc định. PasswordEncoder hiện có băm mật khẩu trước
khi lưu. Seed không in mật khẩu hoặc token vào log. Các tài khoản demo được đặt
email_verified=true để trình diễn không cần SMTP. Đây là dữ liệu giả ở domain
.test, không phải luồng xác minh email thật.

## Kiểm thử trước

Chạy từ thư mục backend:

```powershell
.\mvnw.cmd "-Dtest=DemoDataSeederTest,DemoSeedIntegrationTest" test
.\mvnw.cmd test
```

DemoSeedIntegrationTest dùng H2, Flyway và khóa JWT giả từ profile test; không
kết nối MySQL hoặc gửi email thật. Test xác nhận seed sau migration, quyền ADMIN,
mật khẩu băm, và chạy lại không tạo trùng hoặc đặt lại món đang cho mượn.
Các unit test kiểm tra thêm cờ bật/tắt, loại trừ prod và không nâng quyền tài khoản
đã tồn tại chỉ vì trùng email seed.

## Chạy trên database demo riêng

1. Tạo database uni_lend_demo trong MySQL. Nếu muốn dùng bản sao thử nghiệm đã có,
   đặt DB_URL tương ứng một cách có chủ đích. Không bật seed trên database nhóm
   đang dùng chung hoặc database production.
2. Cấp DB_PASSWORD và JWT_SECRET như hướng dẫn PROFILE_CONFIG.md. Profile demo
   không tự đọc backend/.env; biến môi trường hoặc tham số dòng lệnh phải được cấp.
3. Đặt SEED_ENABLED=true, SEED_ADMIN_PASSWORD và SEED_USER_PASSWORD ở môi trường
   local riêng. Không commit các giá trị thật.
4. Chạy:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=demo --server.port=8081"
```

Flyway tạo/nâng schema trước, rồi runner mới seed. Với DB cũ chưa có Flyway history,
phải làm quy trình backup/đối chiếu/baseline riêng trước; seed không tự giải quyết
schema thiếu. Có thể dùng dev với cùng ba biến SEED_* nếu chủ đích seed database dev.

## Docker demo tùy chọn

Lệnh Docker bình thường vẫn chạy prod và không seed. Khi đã có Docker hoạt động,
thêm SEED_ADMIN_PASSWORD và SEED_USER_PASSWORD vào file .env.docker riêng, rồi chạy
rõ override dưới đây từ thư mục gốc dự án:

```powershell
docker compose --env-file .env.docker -f compose.yaml -f compose.demo.yaml up -d --build
```

Override chuyển riêng backend sang demo và bật seed; dữ liệu vẫn vào volume MySQL
của stack đang chọn. Dùng volume demo riêng nếu stack đang chứa dữ liệu cần bảo vệ.
Chạy lại lệnh không có compose.demo.yaml để trở về prod sẽ tắt runner nhưng không
xóa tài khoản/đồ đã tạo trong database. Không xóa volume để tắt seed.

## Chạy lại và tài khoản đã có

Seed tìm user theo email, danh mục theo tên không phân biệt hoa thường và món đồ
theo chủ đồ + tiêu đề không phân biệt hoa thường. Chạy lại không đặt lại mật khẩu,
quyền, trạng thái khóa tài khoản hoặc trạng thái món đang cho mượn. Nếu email ADMIN
mẫu đang thuộc về tài khoản không có quyền tương ứng, seed dừng với lỗi thay vì
nâng quyền tài khoản đó. Bật seed thiếu mật khẩu hợp lệ cũng dừng trước khi ghi dữ liệu.

Cơ chế dành cho một tiến trình dev/demo, không phải công cụ đồng bộ fixture cho
nhiều instance khởi động đồng thời. Không tự xóa dữ liệu cũ. Tắt SEED_ENABLED khi
không cần bổ sung dữ liệu mẫu nữa; tài khoản và đồ mẫu đã có sẽ được giữ lại.

Frontend snapshot vẫn dùng mock-auth ở các màn hình tài khoản; seed tài khoản trong
backend không tự tạo phiên đăng nhập frontend. Dùng API/Swagger để kiểm tra backend,
và ghép fe-auth-real-api để demo luồng giao diện đầy đủ.

## Trạng thái kiểm chứng

Đã chạy độc lập DemoDataSeederTest trên Java 17: 6 unit test đạt, gồm BCrypt,
chạy lại không tạo trùng, giữ dữ liệu sửa đổi, từ chối tài khoản trùng email sai
quyền, cờ bật/tắt và loại trừ prod kể cả khi trộn profile.

Đã thêm DemoSeedIntegrationTest dùng Flyway + H2 trong ứng dụng đầy đủ. Chưa chạy
full Maven/JDK 25, integration test H2 hoặc seed trên MySQL/Docker tại môi trường
soạn gói; cần chạy trên máy dự án trước khi xác nhận triển khai thành công.
