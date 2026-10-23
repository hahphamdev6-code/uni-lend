# Upload ảnh an toàn — tuần 4 — Trần Duy Huy

## Phạm vi

Gói này chỉ chứa các file mới/thay đổi của nhánh feature/be-upload-hardening.
Không xóa backend cũ. Sao chép thư mục backend trong gói vào thư mục gốc dự án
C:\Users\TRAN HUY\ttcsn và chọn ghi đè file trùng tên. Không copy backend vào
bên trong backend. Gói không chứa .env, target hoặc mật khẩu.

## Thay đổi

- Đọc chữ ký PNG/JPEG/WebP và giải mã nội dung thật bằng ImageIO.
- Không dựa vào Content-Type hoặc đuôi file do client gửi. Ảnh thật có MIME sai vẫn
  được nhận; file văn bản đổi tên .jpg hoặc chỉ giả chữ ký bị từ chối.
- Thêm TwelveMonkeys imageio-webp 3.12.0 để giải mã WebP.
- Mã hóa lại dữ liệu pixel thành JPEG/PNG, loại metadata và dữ liệu gắn thêm.
  WebP được lưu thành PNG tĩnh, chỉ lấy khung đầu; không giữ ảnh động hoặc metadata.
  Đuôi file lưu do server quyết định, tên UUID; tên gốc không dùng làm đường dẫn.
- Mỗi ảnh đầu vào và sau chuẩn hóa tối đa 5 MiB. Tối đa 16 triệu pixel và 8192 pixel
  mỗi chiều để giới hạn tài nguyên khi giải mã. Ảnh WebP nhỏ có thể thành PNG lớn
  hơn 5 MiB và bị từ chối; khi đó cần giảm kích thước ảnh.
- Mỗi món đồ tối đa 5 ảnh, kể cả ảnh đã có. Dùng khóa PESSIMISTIC_WRITE trên Item
  trước khi đếm để tuần tự hóa các upload cùng món đồ.
- Giữ giới hạn multipart hiện tại: mỗi file 5MB, toàn bộ request 26MB (gồm header).
  Do tối đa 5 file x 5MB, tổng nội dung file hợp lệ tối đa 25MB.
- Gộp cả hai tên field files và images trước khi kiểm tra số lượng; không bỏ qua
  một nhóm khi client gửi đồng thời cả hai.
- Kiểm tra toàn bộ batch trước khi ghi. Xóa file mới nếu ghi file/save/flush lỗi;
  callback afterCompletion dọn file khi transaction không commit thành công,
  kể cả lỗi commit xuất hiện sau khi service trả về. File cũ không bị dọn theo.
- Chặn đường dẫn xóa thoát khỏi upload root.

## File cần chép vào dự án

Đường dẫn bên dưới tính từ thư mục gốc ttcsn:

1. backend/pom.xml
2. backend/src/main/java/com/unilend/backend/service/ImageUploadValidator.java (mới)
3. backend/src/main/java/com/unilend/backend/service/ItemService.java
4. backend/src/main/java/com/unilend/backend/repository/ItemRepository.java
5. backend/src/main/java/com/unilend/backend/controller/ItemController.java
6. backend/src/main/java/com/unilend/backend/common/exception/GlobalExceptionHandler.java
7. backend/src/main/resources/application.yaml (chỉ bổ sung chú thích giới hạn multipart)
8. backend/src/test/java/com/unilend/backend/service/ImageUploadValidatorTest.java (mới)
9. backend/src/test/java/com/unilend/backend/service/ItemServiceUploadTest.java (mới)
10. backend/src/test/resources/upload/valid.png (mới)
11. backend/src/test/resources/upload/valid.jpg (mới)
12. backend/src/test/resources/upload/valid.webp (mới)
13. backend/src/test/resources/upload/unsupported.gif (mới, test định dạng bị từ chối)
14. backend/docs/UPLOAD_HARDENING.md (tài liệu này)

## Kiểm tra trên PowerShell

Đóng tiến trình backend trước khi ghi đè file. Mở terminal tại dự án và chạy:

```powershell
cd "C:\Users\TRAN HUY\ttcsn"
git branch --show-current
git status --short
java -version
```

Nhánh dự kiến: feature/be-upload-hardening. Java cần JDK 25 đúng pom gốc.
Nếu đang ở nhánh khác, kiểm tra thay đổi trước khi chuyển nhánh.

Chạy các test riêng cho phần upload (không cần MySQL hoặc .env):

```powershell
cd "C:\Users\TRAN HUY\ttcsn\backend"
.\mvnw.cmd "-Dtest=ImageUploadValidatorTest,ItemServiceUploadTest" test
```

Kết quả cần: BUILD SUCCESS; Tests run không có Failures/Errors. Nếu lỗi, gửi toàn
bộ đoạn ERROR và các report trong backend/target/surefire-reports; chưa commit.

Các test gồm JPG/PNG/WebP thật, MIME/đuôi giả, chữ ký bị cắt, GIF, file rỗng,
file >5MB, luồng dữ liệu báo sai size, kích thước pixel lớn, bỏ payload gắn thêm,
quyền chủ đồ, quota, lỗi save/flush/ghi file, và callback commit/rollback dọn file.
Test ItemService dùng repository mock và gọi callback giao dịch; chưa phải kiểm
thử transaction/khóa cạnh tranh trên MySQL thật. MockMvc cũng không mô phỏng giới
hạn multipart của servlet, vì vậy cần kiểm tra bằng server thật bên dưới.

Sau khi test riêng thành công, chạy toàn bộ test để phát hiện ảnh hưởng:

```powershell
.\mvnw.cmd test
```

## Kiểm tra API trên server thật

Chạy backend bằng cấu hình DB/JWT hiện có. Đăng nhập và dùng Swagger với token thật.
Upload bằng POST /api/items/{id}/images hoặc /items/{id}/images, multipart field
files (hoặc images). id phải là món đồ của tài khoản đang đăng nhập.

- JPG, PNG, WebP thật: 201, URL ảnh truy cập được. WebP nhận URL .png.
- Tạo file văn bản có tên fake.jpg, gửi MIME image/jpeg: 400, DB/file không tăng.
- Một ảnh hợp lệ + một ảnh giả trong cùng batch: 400, không tạo ảnh nào.
- Tổng ảnh món đồ >5, hoặc gửi files và images cộng lại >5: 400.
- File >5MB hoặc request >26MB: servlet từ chối, không ghi ảnh. Proxy phía trước
  nếu có có thể trả 413 trước khi request tới ứng dụng.
- Upload bằng tài khoản không sở hữu món đồ: 403.
- Gửi đồng thời hai batch làm tổng vượt 5 trên MySQL: tối đa một batch được nhận,
  tổng ảnh trong DB không vượt 5. Cần xác minh trên DB thật trước khi khẳng định
  hành vi cạnh tranh đã được kiểm thử.

## Trạng thái kiểm chứng khi bàn giao

Đã soát đường dẫn, diff với ZIP đầu vào, cấu trúc XML của pom, nội dung gói và
fixture ảnh bằng Pillow. Chưa compile hoặc chạy được JUnit/Maven: môi trường
bàn giao chỉ có Java 17 runtime và không truy cập được repo.maven.apache.org
để tải parent Spring Boot 4.1.1. Không đổi Java/Spring Boot của dự án để né lỗi.
Cần chạy các lệnh trên máy JDK 25 của bạn. Chưa kiểm thử API, WebP bằng ImageIO,
hoặc khóa/giao dịch trên MySQL thật. Không coi các test đã pass.

## Commit và push sau khi test thành công

```powershell
cd "C:\Users\TRAN HUY\ttcsn"
git diff --check
git diff --stat
git status --short
git add backend/pom.xml backend/src/main/java/com/unilend/backend/service/ImageUploadValidator.java backend/src/main/java/com/unilend/backend/service/ItemService.java backend/src/main/java/com/unilend/backend/repository/ItemRepository.java backend/src/main/java/com/unilend/backend/controller/ItemController.java backend/src/main/java/com/unilend/backend/common/exception/GlobalExceptionHandler.java backend/src/main/resources/application.yaml backend/src/test/java/com/unilend/backend/service/ImageUploadValidatorTest.java backend/src/test/java/com/unilend/backend/service/ItemServiceUploadTest.java backend/src/test/resources/upload backend/docs/UPLOAD_HARDENING.md
git diff --cached --stat
git commit -m "feat: harden item image uploads and clean up on rollback"
git push -u origin feature/be-upload-hardening
```

Sau khi push thành công, tạo PR vào dev để nhóm review trước khi merge.
