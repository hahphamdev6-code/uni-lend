# Kiểm thử tích hợp API đồ dùng

File: `src/test/java/com/unilend/backend/controller/ItemIntegrationTest.java`.

## Phạm vi 9 test

1. Chủ đồ tạo, xem, sửa, xóa; kiểm tra dữ liệu bằng request mới sau mỗi thay đổi.
2. Người khác nhận 403 khi sửa, xóa hoặc upload ảnh; dữ liệu gốc giữ nguyên.
3. Chưa đăng nhập nhận 401 khi ghi dữ liệu, upload hoặc xem `/items/me`.
4. Tên trống nhận 400, danh mục không tồn tại nhận 404; không tạo đồ ngoài ý muốn.
5. `/items/me` chỉ trả đồ của người đang đăng nhập.
6. Tìm kiếm công khai kết hợp từ khóa, danh mục, trạng thái và phân trang.
7. Tự chuyển trạng thái sang LENT_OUT bị từ chối; thay đổi tên trước đó được rollback.
8. Upload PNG thật tạo bản ghi và file; người khác không xóa được ảnh, chủ đồ xóa được cả hai.
9. Lô gồm ảnh hợp lệ và file giả PNG bị từ chối toàn bộ, không lưu bản ghi hay file.

## Cách hoạt động

- SpringBootTest + MockMvc + Spring Security, không mock bean nghiệp vụ.
- Tạo user fixture trong H2, ký JWT bằng JwtService thật rồi gọi HTTP với Bearer token.
- Luồng đăng ký/đăng nhập được kiểm tra riêng ở AuthAndLoanIntegrationTest.
- Profile test, cơ sở dữ liệu H2 riêng `unilend-items-integration`; Flyway tạo schema và Hibernate validate.
- Không bọc toàn bộ test trong transaction: các request hoàn thành transaction thật để kiểm tra commit/rollback.
- Mỗi test có user riêng. Seed và gửi mail tắt.
- Upload sử dụng thư mục tạm riêng, dọn sau khi kết thúc lớp test. Không dùng thư mục uploads của ứng dụng.
- Dùng fixture `src/test/resources/upload/valid.png` có sẵn từ phần upload hardening.
- H2 không thay thế kiểm thử MySQL hoặc giới hạn multipart trên máy chủ HTTP thật.

## Chạy trên PowerShell

Tại thư mục backend:

```powershell
.\mvnw.cmd "-Dtest=ItemIntegrationTest" test
.\mvnw.cmd verify
```

Cần Java 25 và các thay đổi profile test + Flyway V2 đã có ở các nhánh trước.
CI hiện chạy `verify`, nên tự động phát hiện lớp có tên kết thúc bằng `Test` này.

## Trạng thái bàn giao

Đã đối chiếu endpoint, DTO, mã trạng thái, JWT và xử lý file với mã nguồn dự án được cung cấp.
Chưa chạy 9 test mới trong môi trường soạn gói (chỉ có Java 17).
Cần lưu kết quả Maven/CI thực tế sau khi áp dụng; không coi các lần BUILD SUCCESS trước là kết quả của test mới.
