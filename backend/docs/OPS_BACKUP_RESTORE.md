# Vận hành backup/restore và migration

Tài liệu áp dụng cho Compose production tại `backend/docker-compose.production.yml` trên nhánh `docs/ops-backup-restore`. Nhánh này được tạo từ commit `edfc08c` và phụ thuộc observability ở commit `070e81e` (production profile, Actuator readiness/liveness). Không đưa file backup, dữ liệu thật hoặc file môi trường chứa secrets vào Git.

## Thành phần và điều kiện

Compose định nghĩa service `db` (MySQL 8.4) và `api`; schema lấy từ `MYSQL_DATABASE`. Các volume logic là `mysql-data` tại `/var/lib/mysql` và `uploads` tại `/app/uploads` (biến `UPLOAD_DIR`). Với Compose project `unilend-production`, tên volume mặc định là `unilend-production_mysql-data` và `unilend-production_uploads`. Compose không publish cổng MySQL; API chỉ bind `127.0.0.1:8080`. Readiness là `/actuator/health/readiness`, liveness là `/actuator/health/liveness`.

Trên commit nền, Flyway bật, `clean-disabled: true`, JPA dùng `ddl-auto: validate`; migration MySQL hiện có là `V1__initial_schema.sql`, tạo các bảng `users`, `user_roles`, `categories`, `items`, `item_images`, `loan_requests`, `notifications`, `reviews`, `account_tokens`. Migration này không tạo dữ liệu mẫu. Kiểm tra lại các thông tin trên khi nâng phiên bản ứng dụng.

Cần PowerShell, Docker Engine, Docker Compose plugin, quyền truy cập host/volume, nơi lưu backup riêng tư đủ dung lượng và một môi trường thử nghiệm cô lập. Cần `mysqldump`/`mysql` trong image MySQL (các lệnh dưới chạy bên trong container). Hiện môi trường soạn tài liệu không có Docker CLI, `mysql` hoặc `mysqldump`; chỉ có MySQL Shell 8.0.46. **Chưa thực hành restore thực tế.** Các bước sau là quy trình cần chạy trong môi trường được cấp phép; không dùng production làm đích thử nghiệm.

## Backup nhất quán

Chọn maintenance window. Dừng API và mọi tiến trình/job khác có thể ghi DB hoặc uploads; xác nhận không còn writer. Việc dừng writer giúp dump DB và bản sao uploads phản ánh cùng một điểm vận hành. `--single-transaction` chỉ bảo đảm snapshot nhất quán cho bảng InnoDB, không thay cho việc dừng writers. Không dùng lệnh này với volume production nếu chưa có phê duyệt vận hành và kế hoạch lưu trữ phù hợp.

Ví dụ PowerShell dưới đây dùng placeholder, chạy từ thư mục `backend`. Tạo bundle mới ngoài repository; nếu đường dẫn đã tồn tại thì dừng và chọn tên khác. Không dùng PowerShell `>`/`Out-File` để xuất SQL: Windows PowerShell có thể đổi encoding. `--result-file` tạo SQL trong container, sau đó `docker cp` sao chép dạng nhị phân. Tham số `--password` không có giá trị sẽ hỏi mật khẩu tương tác; tuyệt đối không thêm mật khẩu vào command line.

```powershell
$ErrorActionPreference = 'Stop'
$compose = @('compose', '-p', 'unilend-production', '--env-file', '<secure-path>/.env.production', '-f', 'docker-compose.production.yml')
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss-UTC'
$bundle = Join-Path '<secure-backup-root>' "unilend-$stamp"
if (Test-Path -LiteralPath $bundle) { throw 'Backup path already exists; choose a new timestamp/path.' }
New-Item -ItemType Directory -Path $bundle | Out-Null

# Tạm dừng writers trước đó; ghi nhận bằng chứng maintenance trong biên bản.
& docker @compose stop api
if ($LASTEXITCODE -ne 0) { throw 'Could not stop API; do not continue backup.' }

& docker @compose exec db sh -c 'mysqldump --user=root --password --single-transaction --routines --triggers --events --hex-blob --no-tablespaces --default-character-set=utf8mb4 --result-file=/tmp/unilend-backup.sql "$MYSQL_DATABASE"'
if ($LASTEXITCODE -ne 0) { throw 'mysqldump failed; backup is incomplete.' }
& docker @compose cp db:/tmp/unilend-backup.sql (Join-Path $bundle 'database.sql')
if ($LASTEXITCODE -ne 0) { throw 'Could not copy SQL dump; backup is incomplete.' }
& docker @compose exec db rm -f /tmp/unilend-backup.sql
if ($LASTEXITCODE -ne 0) { throw 'Could not remove temporary dump from DB container.' }
```

`docker compose cp` với service sẽ dùng cú pháp `docker compose cp db:/... <host-path>`; nếu bản Compose cài đặt không hỗ trợ cách gọi trên, dùng `docker cp <container-id>:/tmp/unilend-backup.sql <host-path>` sau khi lấy container ID bằng `docker compose ps -q db`. Không in biến môi trường hoặc `docker compose config` ra log.

Sao lưu volume uploads vào archive mới. Thay `<bundle-path-forward-slashes>` bằng đường dẫn tuyệt đối của bundle với dấu `/`; kiểm tra trước rằng volume và đường dẫn đích đúng. Lệnh helper chỉ mount volume đọc.

```powershell
& docker run --rm --mount 'type=volume,source=unilend-production_uploads,target=/source,readonly' --mount 'type=bind,source=<bundle-path-forward-slashes>,target=/out' alpine:3.21 tar -czf /out/uploads.tar.gz -C /source .
if ($LASTEXITCODE -ne 0) { throw 'Uploads archive failed; backup is incomplete.' }
```

Ghi metadata riêng tư `metadata.txt`: timestamp và múi giờ; commit/image tag và phiên bản ứng dụng (lấy từ release đang chạy, không suy đoán từ working tree); phiên bản MySQL; schema; migration Flyway đã áp dụng (version, script, checksum, success); service/project/volume; người thực hiện và thời điểm dừng/bật writers. Lấy Flyway history bằng truy vấn `SELECT installed_rank, version, description, type, script, checksum, installed_on, success FROM flyway_schema_history ORDER BY installed_rank;` và lưu vào hồ sơ được bảo vệ, không lưu credentials. Đếm bản ghi của từng bảng để làm số liệu đối chiếu; tránh đưa dữ liệu cá nhân vào báo cáo.

Tạo manifest SHA-256 và kiểm tra các file tồn tại, kích thước hợp lý; chỉ đánh dấu backup thành công sau khi mọi lệnh backup và kiểm tra đều thành công:

```powershell
Get-FileHash (Join-Path $bundle 'database.sql') -Algorithm SHA256
Get-FileHash (Join-Path $bundle 'uploads.tar.gz') -Algorithm SHA256
```

Ghi kết quả hash vào metadata/manifest trong bundle; bảo vệ backup theo chính sách dữ liệu riêng tư, giới hạn quyền đọc và lưu ngoài repository. Sau khi hoàn tất, khởi động lại API, chờ readiness healthy rồi mới mở writers. Nếu có bước lỗi, coi bundle là không hoàn chỉnh, không báo thành công và không ghi đè; lưu/đánh dấu nó theo quy trình xử lý sự cố.

## Restore vào môi trường thử nghiệm mới

Restore có thể thay thế toàn bộ dữ liệu của database đích. Chỉ dùng DB/container/volume thử nghiệm hoàn toàn mới, dữ liệu giả và thư mục uploads thử nghiệm riêng. Không trỏ lệnh dưới vào project `unilend-production`, volume `unilend-production_mysql-data`/`unilend-production_uploads`, hoặc bất kỳ DB thật nào. Dùng project/container/volume có tên duy nhất; kiểm tra chúng chưa tồn tại trước khi tạo. Không publish cổng DB. Nếu môi trường không thể bảo đảm cách ly, dừng và xin môi trường thử nghiệm.

Trước restore, kiểm tra SHA-256 của cả `database.sql` và `uploads.tar.gz` khớp manifest. Tạo MySQL thử nghiệm với image cùng major version, schema thử nghiệm riêng và volume mới. Cấp password qua prompt tương tác; nếu cần `--env-file`, file phải ở ngoài repository, chỉ operator đọc được, chứa secrets thử nghiệm riêng và không được in ra. Ví dụ khung tạo container (điền tên unique, không tái sử dụng tên/volume):

```powershell
docker volume create <unique-test-db-volume>
docker run -d --name <unique-test-db-container> --mount 'type=volume,source=<unique-test-db-volume>,target=/var/lib/mysql' --env-file <secure-test-env-file> mysql:8.4
docker logs <unique-test-db-container>
```

Chờ MySQL healthy/ready; chuyển dump bằng `docker cp` vào container mới. Dump ở trên không dùng `--databases`, nên import vào schema thử nghiệm đã tạo sẵn. Kết nối bằng prompt (không truyền mật khẩu trong argv), rồi import từ file trong container bằng client `mysql`/`source` hoặc shell redirection **bên trong Linux container**; kiểm tra exit code và lỗi trước khi tiếp tục. Không dùng PowerShell để pipe nội dung SQL. Nếu import lỗi, dừng và giữ nguyên bằng chứng; không chạy `clean`, reset hoặc xóa volume để thử lại.

Tạo volume uploads thử nghiệm riêng, mount chỉ cho helper container và giải nén archive vào đó. Ví dụ cấu trúc (các tên phải unique; mount nguồn archive chỉ đọc):

```powershell
docker volume create <unique-test-uploads-volume>
docker run --rm --mount 'type=bind,source=<bundle-path-forward-slashes>/uploads.tar.gz,target=/backup/uploads.tar.gz,readonly' --mount 'type=volume,source=<unique-test-uploads-volume>,target=/restore' alpine:3.21 tar -xzf /backup/uploads.tar.gz -C /restore
```

### Đối chiếu sau phục hồi

So sánh với metadata và số liệu trước backup, không chỉ dựa vào việc container khởi động:

1. Liệt kê bảng và xác nhận đủ chín bảng V1; ghi số bản ghi từng bảng (`users`, `user_roles`, `categories`, `items`, `item_images`, `loan_requests`, `notifications`, `reviews`, `account_tokens`) và so sánh với số liệu đã ghi. Dữ liệu thật chỉ kiểm tra tại môi trường được bảo vệ; báo cáo chỉ ghi counts.
2. Kiểm tra `information_schema.table_constraints`/`key_column_usage` để xác nhận các foreign key dự kiến hiện diện. Kiểm tra không có orphan: `user_roles.user_id → users.id`; `items.owner_id → users.id`, `items.category_id → categories.id`; `item_images.item_id → items.id`; `loan_requests.item_id → items.id`, `borrower_id → users.id`; `notifications.user_id → users.id`; `reviews.loan_id → loan_requests.id`, `reviewer_id`/`reviewee_id → users.id`; `account_tokens.user_id → users.id`. So sánh số orphan bằng 0.
3. Đọc toàn bộ `flyway_schema_history`; so version, script, checksum và success với metadata. Không sửa history bằng tay.
4. Với dữ liệu giả đã định trước, xác nhận các hàng và quan hệ mẫu bằng khóa giả/ID; không in email, token, nội dung cá nhân. Xác nhận `item_images.image_url` trỏ tới file tương ứng dưới `/restore/items/<item-id>/...`, file tồn tại và không rỗng. Kiểm tra vài file ảnh mở/đọc được và so checksum nếu đã ghi checksum trước backup.
5. Ghi kết quả, thời gian restore, image/version và các sai lệch. Chỉ coi lần diễn tập thành công nếu import, kiểm tra DB, Flyway, dữ liệu giả và uploads đều đạt.

## Triển khai migration và rollback

Trước triển khai, xác nhận backup hợp lệ và có thể đọc; xem xét nội dung migration mới, tương thích với phiên bản ứng dụng cũ/mới và thời gian khóa bảng. Triển khai ở staging trước, rồi theo change window production. Dùng image bất biến/tag đã ghi nhận; Compose khởi động `db` trước khi `api` healthy. Ứng dụng chạy Flyway lúc khởi động theo cấu hình hiện có. Sau deploy, kiểm tra readiness, logs không chứa credentials/PII, Flyway history, API chính và dữ liệu. Không chạy Flyway `clean`, không reset dữ liệu.

Flyway không tự đảo ngược migration SQL. Không sửa migration đã áp dụng, không xóa dòng history để ép chạy lại. Với lỗi ứng dụng, rollback ứng dụng nghĩa là triển khai lại image trước đó; chỉ an toàn khi schema mới vẫn tương thích ngược. Nếu migration đã thay đổi/xóa dữ liệu hoặc schema không tương thích, rollback ứng dụng đơn thuần không phục hồi dữ liệu. Phục hồi database là thao tác riêng: restore bộ backup vào DB đích theo quy trình phê duyệt, có thể làm mất mọi ghi nhận phát sinh sau thời điểm backup. Đánh giá và thông báo tác động trước; kiểm thử trên đích mới trước khi chọn phương án production. Ưu tiên migration sửa tiếp theo theo hướng tương thích (expand/contract) thay vì chỉnh migration đã áp dụng.

## Kiểm tra đã thực hiện trong môi trường tài liệu

Máy trước đó chưa có Docker CLI; hiện cũng không tìm thấy `docker`, `mysql` hoặc `mysqldump` trên PATH. Có MySQL Shell 8.0.46, nhưng công cụ này không cung cấp môi trường Compose/MySQL server cô lập để diễn tập quy trình trên. Vì vậy **Chưa thực hành restore thực tế**; không có DB, volume hay dữ liệu nào được tạo hoặc sửa. Sau khi có môi trường Docker/MySQL thử nghiệm riêng, chạy toàn bộ backup → restore → đối chiếu ở trên, lưu kết quả và chỉ khi thành công mới ghi nhận diễn tập đã đạt. Tài liệu này không thay thế nghiệm thu phục hồi.
