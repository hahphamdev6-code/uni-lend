# Chạy UniLend bằng Docker

Gói Docker tại thư mục gốc chạy ba service: frontend Next.js, backend Spring Boot
và MySQL. Backend chọn profile prod, chạy Flyway rồi Hibernate validate. MySQL và
ảnh upload có volume riêng. Dữ liệu demo/ADMIN không được tự thêm vào database.

## Yêu cầu và vị trí chạy

Cài Docker Desktop, bật Linux containers và đợi Docker Engine sẵn sàng. Chạy các
lệnh từ thư mục gốc dự án chứa compose.yaml, ví dụ C:\Users\TRAN HUY\ttcsn.
Không cần cài Java, Maven, Node hoặc MySQL trên host để build container. Lần build
đầu cần Internet để tải image và dependency. Máy phải còn đủ RAM/dung lượng đĩa.

```powershell
docker version
docker compose version
```

Profile config/V2 phải có trong nhánh này. Nhánh Docker được tạo từ
feature/be-profile-config đang chờ merge; khi review cần ghi rõ phụ thuộc này.
Sau khi profile config đã vào dev, cập nhật nhánh và PR theo quy trình nhóm.

## Tạo cấu hình riêng cho Docker

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Init-DockerEnv.ps1
```

Script tạo .env.docker từ .env.docker.example, tự sinh hai mật khẩu MySQL và khóa
JWT Base64 bằng bộ sinh ngẫu nhiên mật mã. Script không in bí mật và không ghi đè
.env.docker đã có. Không đưa .env.docker lên Git. Giữ file này cùng các volume hiện
có: thay mật khẩu trong env không tự đổi mật khẩu user bên trong MySQL đã khởi tạo.

.env.docker tách khỏi backend/.env và frontend/.env.local. Chỉ truyền biến được
liệt kê trong compose.yaml vào container. Shell có thể ghi đè biến Compose cùng
tên; nếu đã đặt DB_PASSWORD/JWT_SECRET từ các lần thử trước, kiểm tra và dùng
terminal mới khi cần. Lệnh kiểm tra dưới đây không in toàn bộ cấu hình có mật khẩu:

```powershell
docker compose --env-file .env.docker -f compose.yaml config --quiet
```

## Build và khởi động

```powershell
docker compose --env-file .env.docker -f compose.yaml up -d --build
docker compose --env-file .env.docker -f compose.yaml ps
```

Compose chờ MySQL thực thi được SELECT 1 bằng user ứng dụng, rồi mới chạy backend.
Backend healthcheck gọi GET /categories, vì vậy schema phải hoạt động. Frontend
chỉ khởi động sau khi backend healthy. Lần đầu MySQL khởi tạo volume và Flyway chạy
V1/V2 có thể mất vài phút; Dockerfile backend bỏ qua chạy test khi đóng gói, nên
phải chạy test riêng trước khi merge.

Địa chỉ mặc định, chỉ bind ra localhost của máy đang chạy Docker:

| Thành phần | Địa chỉ |
| --- | --- |
| Frontend | http://localhost:3000 |
| API trực tiếp | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui/index.html |
| API qua frontend | http://localhost:3000/api/items |
| Ảnh upload qua frontend | http://localhost:3000/uploads/ten-file |

MySQL không publish cổng ra host và không dùng MySQL cài sẵn trên Windows.
Project Compose tên unilend tạo volume unilend_mysql-data và unilend_uploads;
không mount hoặc nhập database uni_lend trên host vào stack này. Database mới rỗng
được tạo từ migration. Muốn dùng dữ liệu cũ phải làm backup/restore và diễn tập
migration theo backend/docs/DB_MIGRATION.md, không bật baseline tự động để ép chạy.

## Cách frontend kết nối API

Trình duyệt dùng NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api. Next.js
rewrite /api/:path* sang http://backend:8080/:path* trong mạng Compose. Ảnh tại
/uploads/:path* cũng được proxy về backend.
Vì trình duyệt gọi cùng origin với frontend, các request có credentials không
phụ thuộc vào cross-origin CORS giữa cổng 3000 và 8080. Không đặt địa chỉ
http://backend:8080 làm URL public trong trình duyệt vì chỉ container hiểu tên này.

Frontend có các service dùng /items và một số dùng /api/categories; proxy giữ phần
path sau prefix đầu tiên nên cả hai cách đều đến đúng alias backend. Không đổi
contract của các service frontend trong gói Docker này. Next.js mặc định chỉ buffer
body 10 MiB; cấu hình proxyClientMaxBodySize được đặt 26 MiB để truyền được tối đa
năm ảnh 5 MiB kèm multipart headers. Backend tiếp tục kiểm tra dung lượng từng file,
tổng request, số ảnh và nội dung ảnh thực tế.

NEXT_PUBLIC_API_BASE_URL và INTERNAL_API_BASE_URL được chốt lúc next build. Đổi
URL public, host hoặc FRONTEND_PORT cần sửa tương ứng FRONTEND_URL,
CORS_ALLOWED_ORIGINS và NEXT_PUBLIC_API_BASE_URL trong .env.docker, rồi build lại
frontend. INTERNAL_API_BASE_URL cố định theo tên service backend trong Compose.

Chạy npm run dev ngoài Docker giữ cách cấu hình frontend/.env.local hiện có;
rewrites chỉ bật khi INTERNAL_API_BASE_URL được đặt. Không thêm giá trị này vào
frontend/.env.local nếu muốn frontend gọi trực tiếp backend như trước.

## Kiểm tra sau khởi động

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-Docker.ps1
```

Script chỉ đọc trang chủ, API trực tiếp và API qua proxy, bao gồm cả alias danh mục.
Nếu đổi port thì truyền -FrontendUrl và -BackendUrl. Kiểm tra thêm bằng Swagger
các API đăng ký/đăng nhập, upload và mượn/trả khi cần. Không coi healthcheck hoặc
script này là bằng chứng toàn bộ nghiệp vụ đã hoàn thành.

Frontend của snapshot gửi kèm vẫn dùng mock-auth ở AuthProvider, đăng nhập, đăng
ký và profile. Docker không chuyển các màn hình này sang API thật; cần ghép nhánh
fe-auth-real-api của thành viên frontend để demo luồng tài khoản đầy đủ. Gói này
sửa component cũ frontend/components/item-form.tsx để dùng ImageUploader và kiểu
dữ liệu danh mục hiện có, vì các import/kiểu cũ đang chặn production build.
Các trang đang dùng components/ItemForm.tsx tiếp tục dùng component đó.

## Dừng và xem log

```powershell
docker compose --env-file .env.docker -f compose.yaml logs --tail=100 db backend frontend
docker compose --env-file .env.docker -f compose.yaml stop
docker compose --env-file .env.docker -f compose.yaml start
```

Có thể dùng down để tháo container/network và up -d để tạo lại; volume vẫn được
giữ. Không thêm tùy chọn -v nếu cần giữ database/ảnh. Không xóa volume để xử lý
lỗi migration. Sao lưu trước khi nâng cấp hoặc đổi cách lưu dữ liệu.

## SMTP, dữ liệu mẫu và production

MAIL_ENABLED=false trong file mẫu vì đây là stack local, chưa có SMTP. Không có
email xác minh/reset thật khi tắt gửi mail. Nếu bật gửi mail, cấp SMTP_HOST/PORT,
SMTP_USERNAME/PASSWORD và cờ AUTH/STARTTLS phù hợp. SMTP_HOST=localhost trong
container không trỏ tới Windows; Docker Desktop có host.docker.internal nếu SMTP
đang chạy trên host. Gói này không thêm dịch vụ mail bên ngoài.

Backend chạy profile prod với show-sql=false, ddl-auto=validate, Flyway baseline
false và clean-disabled=true. Không thêm seed SQL vào migration. Việc seed ADMIN,
danh mục và đồ mẫu thuộc nhánh be-seed-data; chỉ bật có chủ đích ở dev/demo.
Cấu hình localhost và SMTP tắt là cấu hình chạy thử, chưa phải triển khai Internet
có HTTPS, domain, backup và SMTP production.

## Xử lý lỗi thường gặp

- Cổng 3000/8080 bận: dừng tiến trình local đang giữ cổng hoặc đổi port và URL trong
  .env.docker đồng bộ, rồi build lại frontend.
- Cannot connect to Docker daemon: mở Docker Desktop và kiểm tra docker version.
- MySQL unhealthy: xem log db, kiểm tra user/password của volume đang có. Không
  tạo lại .env.docker ngẫu nhiên cho một volume cũ rồi kỳ vọng mật khẩu tự đổi.
- Backend unhealthy: xem log backend; kiểm tra migration V1/V2, DB và JWT. File mẫu
  không có giá trị bí mật dùng thật, phải chạy script tạo env trước.
- Frontend lỗi TypeScript: gửi log build; không dùng ignoreBuildErrors để bỏ qua.
- API 401 từ các màn hình mock-auth: cần tích hợp fe-auth-real-api; không dùng
  thông tin tài khoản chỉ có trong localStorage để gọi API bảo vệ bằng JWT.

## Kiểm chứng khi chuẩn bị gói

Đã chạy npm ci, npm run build với Next.js 16.3.5 và Node 24. Đã kiểm tra cấu hình
bằng Docker Compose config --quiet. Đã thử standalone server với backend giả để
kiểm tra HTML/static, proxy API, query string, Bearer header, ảnh và body multipart
25 MiB. Backend giả chỉ chứng minh proxy truyền được request/response; không chứng
minh bộ xác thực ảnh của backend hoặc nghiệp vụ đã chạy.

Môi trường chuẩn bị không có Docker Engine nên chưa build image hoặc khởi động
ba container thực tế, chưa kiểm chứng volume qua restart. Cần chạy stack và script
kiểm tra trên Docker Desktop, kiểm tra log Flyway/JPA và persistence trước khi merge.

Tham khảo:
- https://docs.docker.com/compose/how-tos/startup-order/
- https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- https://nextjs.org/docs/app/guides/environment-variables
