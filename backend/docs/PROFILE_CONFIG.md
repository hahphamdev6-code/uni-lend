# Cấu hình môi trường UniLend

Backend có ba profile dev, test và prod. Flyway sở hữu schema; Hibernate chỉ
kiểm tra bằng `ddl-auto=validate` ở cả ba môi trường. Không dùng Hibernate
`update`, `create` hoặc `create-drop` để thay thế migration.

| Profile | Database | SQL log | Nguồn cấu hình |
| --- | --- | --- | --- |
| dev | MySQL | Tắt mặc định, bật bằng SHOW_SQL=true khi cần | Biến môi trường và .env trong thư mục backend |
| test | H2 trong bộ nhớ, migration H2 | Tắt | application-test.yaml ở src/test/resources; khóa JWT giả |
| prod | MySQL | Tắt, kể cả Hibernate SQL và bind logger | Biến môi trường triển khai |

Không chọn profile thì mặc định là dev. Production phải đặt rõ
`SPRING_PROFILES_ACTIVE=prod` hoặc truyền `--spring.profiles.active=prod`.
Không chạy đồng thời dev và prod. Các tham số dòng lệnh và biến Spring chuẩn
vẫn có thể ghi đè cấu hình theo cơ chế Spring Boot; không truyền tham số bật SQL
hoặc đổi ddl-auto khi triển khai production.

## Các file

- src/main/resources/application.yaml: multipart, Flyway, JWT, email và cấu hình chung.
- src/main/resources/application-dev.yaml: MySQL local và import .env.
- src/main/resources/application-prod.yaml: cấu hình production.
- src/test/resources/application-test.yaml: H2 và giá trị giả chỉ dùng cho test.
- .env.example: mẫu local, không chứa bí mật thật.

Đã bỏ thư viện spring-dotenv khỏi pom.xml vì Spring Boot đã có cơ chế import
`.env[.properties]`. Nhờ vậy production/test không tự đọc .env qua một cơ chế
thứ hai. Giữ .env ngoài Git. File .env nhập bởi Spring tuân theo cú pháp Java
properties; khi chứa dấu gạch chéo ngược, đường dẫn Windows nên dùng dấu `/`.

## Chạy dev bằng PowerShell

Mở terminal trong thư mục backend. Nếu chưa có .env, sao chép `.env.example`
thành `.env`, rồi tự điền DB_PASSWORD và JWT_SECRET. Không ghi đè .env đang dùng.
JWT_SECRET phải là Base64 của ít nhất 32 byte ngẫu nhiên.

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Biến SPRING_DATASOURCE_URL/USERNAME/PASSWORD có thể ghi đè DB_URL/USERNAME/PASSWORD;
kiểm tra các biến đã đặt ở terminal khi thấy cấu hình kết nối khác .env.
Không đưa giá trị mật khẩu hoặc token vào log, ảnh chụp hay commit.

## Chạy test

Các test Spring đã được gắn `@ActiveProfiles("test")`. Chạy toàn bộ:

```powershell
.\mvnw.cmd test
```

Hoặc chạy nhóm cấu hình và migration trước:

```powershell
.\mvnw.cmd "-Dtest=ProfileConfigurationTest,DatabaseMigrationTest,MigrationContextTest,AccountTokenRepositoryTest" test
```

Test không cần MySQL, JWT_SECRET thật hoặc SMTP. `application-test.yaml` nằm trên
classpath test và không được đóng gói vào jar production. Các test giữ database
riêng khi cần; test repository cũng chạy Flyway rồi validate, không create-drop.

## Cấu hình production

Cấp các biến dưới đây qua môi trường triển khai. Dùng tài khoản database ứng dụng,
không dùng mật khẩu mẫu trong `.env.example`.

- SPRING_PROFILES_ACTIVE=prod
- DB_URL, DB_USERNAME, DB_PASSWORD
- JWT_SECRET, JWT_ISSUER
- FRONTEND_URL, CORS_ALLOWED_ORIGINS
- SMTP_HOST, MAIL_FROM
- SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD theo SMTP đang dùng
- SMTP_AUTH, SMTP_STARTTLS theo SMTP đang dùng; mặc định true trong prod
- MAIL_ENABLED mặc định true trong prod; chỉ tắt có chủ đích vì email xác minh/
  khôi phục mật khẩu sẽ không được gửi khi giá trị này là false
- UPLOAD_DIR và SERVER_PORT khi cần thay mặc định

Production không import file .env vào Spring. Docker Compose có thể đọc một file
môi trường ở cấp Compose và truyền giá trị vào container; đó là bước triển khai
riêng. Gói này chưa thay đổi Dockerfile/docker-compose.

`show-sql=false`, `format_sql=false`, `open-in-view=false`, SQL logger ở WARN,
bind/extract logger OFF. `baseline-on-migrate=false`, `clean-disabled=true`,
`sql.init.mode=never`. Profile này không thêm tài khoản ADMIN hoặc dữ liệu demo.

## Migration V2 cho code bảo vệ tài khoản vừa được merge

V1 đã xuất bản trước các entity bảo vệ tài khoản nên phải giữ nguyên checksum.
V2__account_security.sql có cả bản MySQL và H2, bổ sung:

- users.email_verified, mặc định false cho tài khoản đang có.
- users.token_version, mặc định 0.
- account_tokens, khóa ngoại đến users và index cho token hash/người dùng/loại token.

V2 không xóa bảng, không đổi mật khẩu và không tự đánh dấu email cũ là đã xác minh.
Không chỉnh hoặc chạy lại V1; không đặt baseline-version=2 để bỏ qua V2.

Với bản sao uni_lend_migration_test đã baseline ở phiên bản 1 trong lần kiểm thử
trước, khởi động dev trên bản sao với baseline-on-migrate=false. Flyway sẽ chạy V2:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=dev --spring.datasource.url=jdbc:mysql://localhost:3306/uni_lend_migration_test --spring.flyway.baseline-on-migrate=false --server.port=8081"
```

Sau khi thành công, kiểm tra log đã migrate đến version 2, Hibernate validate đạt
và Started BackendApplication. Dừng rồi chạy lại cùng lệnh: không có migration mới.
Với DB rỗng, Flyway tự chạy V1 rồi V2. Với DB cũ chưa có history, phải backup,
đối chiếu schema V1 và diễn tập nâng cấp trước khi baseline 1; V2 không thay thế
bước bổ sung ba bảng/ba cột còn thiếu của database 5 bảng cũ.

Nếu database đã được Hibernate hoặc người khác thêm các cột/bảng bảo vệ tài khoản,
V2 sẽ báo trùng. Dừng để đối chiếu cấu trúc và lịch sử; không xóa dữ liệu hoặc sửa
checksum/mốc baseline để ép chạy. Thử trên bản sao trước khi nhóm áp dụng lên DB thật.

## Kiểm chứng của gói thay đổi

Đã chạy trực tiếp bằng JUnit trên Java 17: 4 ProfileConfigurationTest và
4 DatabaseMigrationTest, tổng cộng 8 test đạt. Đã thực thi migration H2 V1 -> V2,
kiểm tra dữ liệu cũ, giá trị mặc định, unique token hash và khóa ngoại.

Chưa chạy toàn bộ Maven test hoặc boot ứng dụng trên MySQL/production tại môi
trường soạn gói: môi trường chỉ có Java 17 và Maven không tải được dependency qua
kết nối của JVM. Cần chạy toàn bộ test bằng Maven/JDK 25 trên máy dự án, rồi thử
khởi động trên bản sao MySQL V1 để xác thực đầy đủ mapping entity và API.

Tài liệu Spring Boot: https://docs.spring.io/spring-boot/reference/features/profiles.html
và https://docs.spring.io/spring-boot/reference/features/external-config.html.
