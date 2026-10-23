# Migration cơ sở dữ liệu với Flyway — tuần 4

## Kết quả và phạm vi

Flyway chịu trách nhiệm tạo và nâng cấp schema; Hibernate chỉ kiểm tra bằng
`ddl-auto: validate`, không tự cập nhật bảng. Có migration V1 cho MySQL và H2
(test), tương ứng 7 entity + bảng user_roles trong backend.zip đã cung cấp:
users, user_roles, categories, items, item_images, loan_requests, notifications,
reviews. Migration tạo khóa chính/ngoại, unique, index và có trạng thái OVERDUE.
Không chèn dữ liệu mẫu. Không thay đổi entity hoặc chức năng upload.

Chưa có entity/token xác minh email hay reset mật khẩu trong bản backend đã gửi.
Nếu dev có các entity/cột mới, phải đối chiếu và bổ sung migration trước khi
khẳng định schema khớp toàn bộ dự án. Không tự tạo tên bảng/cột token.

V1 MySQL dùng InnoDB, utf8mb4_unicode_ci, BIGINT tự tăng, DATETIME(6), BIT(1),
ENUM theo entity. H2 dùng identity, TIMESTAMP WITH TIME ZONE và BOOLEAN; test H2
không chứng minh cú pháp/kiểu dữ liệu MySQL đã chạy thành công. Cần kiểm tra thêm
MySQL 8.4 đang dùng trong Docker của dự án.

## 1. Tạo nhánh từ dev mới nhất

Đã push nhánh upload trước đó. Tại thư mục gốc dự án:

```powershell
cd "C:\Users\TRAN HUY\ttcsn"
git status --short
git fetch origin
git switch dev
git pull --ff-only origin dev
git switch -c feature/be-db-migration
```

`git status --short` phải trống trước khi chuyển nhánh; nếu có thay đổi, gửi kết
quả để xử lý, không reset/xóa. Nếu dev chưa merge upload, nhánh migration vẫn làm
độc lập trên dev. Script bên dưới chỉ thêm dependency Flyway, giữ nguyên các
thay đổi dependency của upload hoặc của thành viên khác nếu đã merge.

## 2. Chép gói và áp dụng

Giải nén rồi chép thư mục backend trong ZIP vào thư mục gốc ttcsn, cho phép gộp
thư mục. Không xóa backend cũ, không đặt thành backend/backend. Gói này gồm SQL,
test, tài liệu và script; không chứa bản thay thế toàn bộ pom/application.yaml.

Sau khi chép, chạy:

```powershell
cd "C:\Users\TRAN HUY\ttcsn"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\backend\scripts\Apply-DbMigration.ps1
git --no-pager diff --stat
```

ExecutionPolicy Bypass chỉ áp dụng cho tiến trình PowerShell vừa chạy, không đổi
thiết lập toàn máy. Script thêm spring-boot-starter-flyway + flyway-mysql dùng
version do Spring Boot quản lý; thêm cấu hình Flyway `{vendor}`, chặn clean và
baseline tự động, chuyển ddl-auto update sang validate, tắt SQL init cơ bản.
Script giữ show-sql như cũ; tách profile production/dev/test là nhiệm vụ kế tiếp.
Nếu có AuthAndLoanIntegrationTest cũ dùng create-drop, script đổi riêng thuộc
tính đó sang validate, giữ nguyên nội dung test để test cũng dùng migration.
Script còn đối chiếu danh sách entity/mapped superclass và SHA-256 nguồn (bỏ khác
biệt CRLF/LF) với snapshot. Nếu entity đổi hoặc xuất hiện entity token mới, script
dừng trước khi sửa pom/config; gửi lại backend.zip mới để cập nhật migration.
File backend/docs/db-entity-snapshot.json chứa mốc đối chiếu, không tự sửa hash để
bỏ qua kiểm tra.
Nếu script gặp cấu hình khác dự kiến, nó dừng trước khi ghi; gửi thông báo để sửa
đúng cấu hình thực tế. Không tự chèn lại block Flyway bằng tay nhiều lần.

## 3. Test trước trên H2, không cần kết nối DB thật

```powershell
cd "C:\Users\TRAN HUY\ttcsn\backend"
.\mvnw.cmd "-Dtest=DatabaseMigrationTest,MigrationContextTest" test
```

DatabaseMigrationTest kiểm tra:
- V1 tạo đủ bảng/index, lần migrate sau không chạy lại và dữ liệu được giữ.
- Unique email, FK, NOT NULL, unique (loan_id, reviewer_id), enum OVERDUE.
- Schema chưa có lịch sử Flyway và không rỗng bị từ chối, dữ liệu không bị sửa.
- Baseline rõ ràng tại version 1 giữ dữ liệu và bỏ qua V1. Thao tác DROP history
  chỉ nằm trong test H2 dùng DB riêng, không dùng để sửa DB thật.

MigrationContextTest khởi động Spring Boot: Flyway tạo schema, Hibernate validate
mọi entity. Nếu có lỗi mapping cột hoặc kiểu dữ liệu, test phải thất bại.
Hai test không dùng MySQL/.env thật. Chưa đổi cấu hình JDK 25 của dự án.

Sau đó chạy toàn bộ test:

```powershell
.\mvnw.cmd test
```

Chỉ chuyển bước tiếp theo khi BUILD SUCCESS, không có Failures/Errors. Các test
hiện có được cấu hình dùng H2. Nếu nhóm bổ sung test DB ngoài H2, kiểm tra riêng.

## 4. DB MySQL mới và trống

Flyway chạy V1 tự động khi backend khởi động lần đầu. Lần sau chỉ validate history
và chạy migration mới. JDBC user cần quyền tạo bảng/index/FK. Với một DB thử mới,
trỏ DB_URL đúng DB đó và dùng cấu hình user/password của bạn; không đổi DB đang
chạy khi chỉ muốn test.

Xác minh sau khi chạy bằng MySQL Workbench:

```sql
SELECT DATABASE();
SHOW TABLES;
SELECT installed_rank, version, description, type, success
FROM flyway_schema_history ORDER BY installed_rank;
```

DB trống chạy V1 phải có version 1, type SQL, success = 1, đủ 8 bảng nghiệp vụ và
history. Đăng ký/đăng nhập, tạo đồ và mượn thử; khởi động lại vẫn giữ dữ liệu.

## 5. DB dev đã có dữ liệu — không chạy V1 tạo lại bảng

Giữ baseline-on-migrate=false mặc định. Nếu bật app trên DB cũ chưa có history,
Flyway sẽ báo non-empty schema, không tự nhận DB đó là V1. Không sửa bằng cách
thêm IF NOT EXISTS, xóa bảng, clean hay bật ddl-auto=create/update.

Thứ tự nâng cấp:

1. Dừng backend để tránh thay đổi DB trong lúc sao lưu/đối chiếu.
2. Kiểm tra tên DB và sao lưu bằng MySQL Workbench: Server > Data Export, chọn
   đúng schema, xuất cả cấu trúc và dữ liệu sang file SQL bên ngoài repository.
   Kiểm tra file tồn tại, có CREATE TABLE và INSERT cho những bảng có dữ liệu.
   Không commit bản dump vì có thể chứa dữ liệu tài khoản/mật khẩu băm.
3. Restore bản sao sang DB thử riêng trước; xác minh dữ liệu khôi phục được.
4. Lấy SHOW CREATE TABLE của cả 8 bảng và so với V1 MySQL. Kiểm tra tên cột, kiểu,
   độ dài, nullable, PK, FK, unique, index và enum. Tên FK/unique cũ do Hibernate
   tự sinh có thể khác; kiểm tra chức năng ràng buộc và không tạo trùng.
   Kiểm tra có bảng/cột bổ sung từ các thành viên khác không. Hibernate validate
   không kiểm tra đầy đủ index/unique/nullable, nên không bỏ bước đối chiếu.
5. Nếu DB thực tế khác V1, dừng và gửi DDL đã che thông tin nhạy cảm để tạo kế
   hoạch đối chiếu/ALTER theo dữ liệu hiện tại. Baseline chỉ ghi nhận mốc, không
   sửa hay kiểm chứng schema. Không baseline một DB chưa đối chiếu.
6. Chỉ khi schema đúng V1 và đã test bản sao, chạy một lần bên dưới để tiếp nhận
   DB cũ (DB_URL/user/password phải trỏ đúng bản sao khi tập thử).

```powershell
cd "C:\Users\TRAN HUY\ttcsn\backend"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.flyway.baseline-on-migrate=true --spring.flyway.baseline-version=1"
```

Cờ baseline-on-migrate chỉ dùng tạm trong lệnh này, không ghi vào YAML/.env.
Nếu DB trống, Flyway chạy V1 thay vì ghi baseline; vì vậy phải xác minh đúng DB
cũ trước khi áp dụng. Nếu DB đã có history từ trước, kiểm tra history thay vì
xóa hoặc baseline lại. Khi DB cũ được tiếp nhận, history có version 1/type
BASELINE và V1 SQL được bỏ qua; các migration V2 trở lên sẽ được thực thi.

Sau khi app lên, kiểm tra số dòng từng bảng, các tài khoản/đồ/yêu cầu cũ và file
upload vẫn truy cập được. Dừng bằng Ctrl+C rồi chạy bình thường, không còn cờ:

```powershell
.\mvnw.cmd spring-boot:run
```

Kiểm tra history và dữ liệu thêm lần nữa. Quy trình không xóa hay ghi đè dữ liệu
nghiệp vụ; vẫn cần backup và đối chiếu vì cấu trúc DB thực tế chưa được cung cấp.
MySQL DDL không đảm bảo rollback toàn bộ khi migration lỗi giữa chừng; kiểm tra
trên bản sao trước, không dùng repair để che một schema áp dụng dở dang.

## 6. Quy tắc thêm migration sau này

Không sửa V1 sau khi đã chia sẻ/áp dụng; tạo V2__..., V3__... cho mỗi thay đổi mới.
Mỗi version chỉ được xuất hiện một lần trong một vendor location. Đồng bộ schema
logic MySQL/H2, nhưng giữ kiểu timestamp/identity đúng database. Với entity token
mới, dùng đúng schema và ràng buộc đã chốt với thành viên 1.

Không trộn Hibernate update/create với Flyway. File SQL không chứa mật khẩu, user
ADMIN hoặc dữ liệu demo. Migration phải chạy trên cả DB mới và DB đã nâng cấp.

## 7. Commit/push sau khi test thành công

```powershell
cd "C:\Users\TRAN HUY\ttcsn"
git diff --check
git add backend/pom.xml backend/src/main/resources/application.yaml backend/src/main/resources/db/migration backend/src/test/java/com/unilend/backend/migration backend/src/test/java/com/unilend/backend/controller/AuthAndLoanIntegrationTest.java backend/scripts/Apply-DbMigration.ps1 backend/docs/DB_MIGRATION.md backend/docs/db-entity-snapshot.json
git --no-pager diff --cached --stat
git commit -m "feat: add Flyway initial schema and migration tests"
git push -u origin feature/be-db-migration
```

Tạo PR base dev, ít nhất một reviewer. Kiểm tra API/MySQL thật và baseline trên
bản sao trước khi nhóm dùng migration cho DB có dữ liệu.

## Trạng thái bàn giao

Đã đối chiếu SQL với entity snapshot, soát cột/khóa/index/enum và cấu trúc gói.
Chưa chạy được Maven/JUnit/PowerShell/MySQL ở môi trường bàn giao: chỉ có Java 17
runtime, không có JDK 25, PowerShell hoặc MySQL/Docker; Maven Central không truy
cập được. Cần thực thi test trên máy bạn; không coi test là đã pass.

Tham khảo chính thức:
- https://docs.spring.io/spring-boot/how-to/data-initialization.html
- https://documentation.red-gate.com/flyway/reference/configuration/flyway-namespace/flyway-baseline-on-migrate-setting
- https://documentation.red-gate.com/flyway/reference/commands/baseline

## Kết quả kiểm thử ngày 23/10/2026

- Toàn bộ backend test: BUILD SUCCESS.
- Đã thử trên bản sao MySQL uni_lend_migration_test.
- Đã bổ sung 3 cột users và 3 bảng còn thiếu trên bản sao.
- Flyway baseline phiên bản 1 thành công.
- Khởi động lại với baseline-on-migrate=false thành công.
- Hibernate ddl-auto=validate thành công.
- Database gốc uni_lend chưa được nâng cấp.
- V1 khởi tạo database rỗng. Database cũ phải được sao lưu,
  đối chiếu và bổ sung cấu trúc còn thiếu trước khi baseline.
