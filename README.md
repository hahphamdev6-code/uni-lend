# uni-lend

Nền tảng cho mượn đồ dùng trong trường học.

- **Frontend:** Next.js (App Router) + Tailwind CSS — thư mục `frontend/`
- **Backend:** Spring Boot (REST API) + Spring Data JPA + MySQL — thư mục `backend/`
- **Auth:** Spring Security + JWT

## Cấu trúc thư mục

```
uni-lend/
├── backend/    # Spring Boot API
└── frontend/   # Next.js app
```

## Chạy Backend (Spring Boot)

Yêu cầu: JDK 17+, Maven, MySQL đang chạy.

1. Tạo file `.env` (hoặc export biến môi trường) dựa theo `backend/.env.example`:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=uni_lend
   DB_USERNAME=root
   DB_PASSWORD=your_password_here
   JWT_SECRET=replace-with-a-long-random-secret
   JWT_EXPIRATION_MS=86400000
   ```
2. Chạy ứng dụng:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. API mặc định chạy tại `http://localhost:8080`.

### API đã có

| Method | Endpoint         | Mô tả                          | Yêu cầu đăng nhập |
|--------|------------------|---------------------------------|--------------------|
| POST   | `/auth/register` | Đăng ký tài khoản               | Không              |
| POST   | `/auth/login`    | Đăng nhập, trả về JWT           | Không              |
| GET    | `/users/me`      | Lấy thông tin user hiện tại     | Có (Bearer token)  |

## Chạy Frontend (Next.js)

Yêu cầu: Node.js 18+.

1. Tạo file `.env.local` dựa theo `frontend/.env.local.example`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```
2. Cài đặt & chạy:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Mở `http://localhost:3000`.

## Biến môi trường cần thiết

| Nơi dùng | Biến                    | Ý nghĩa                                  |
|----------|--------------------------|-------------------------------------------|
| backend  | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` | Kết nối MySQL |
| backend  | `JWT_SECRET`, `JWT_EXPIRATION_MS` | Ký & hết hạn JWT |
| frontend | `NEXT_PUBLIC_API_BASE_URL` | Base URL của backend API |

## Quy ước Git

- Nhánh `main`: bản ổn định.
- Nhánh `dev`: tích hợp tính năng.
- Nhánh `feature/*`: mỗi tính năng một nhánh, tạo Pull Request vào `dev`.
- Mỗi PR cần ít nhất 1 người review trước khi merge.

## Tiến độ Tuần 1

- [x] Khởi tạo project Spring Boot (Web, JPA, MySQL Driver, Security, Validation).
- [x] Cấu hình `application.yml` dùng biến môi trường cho MySQL.
- [x] Entity: `User`, `Item`, `LoanRequest`, `Category`.
- [x] `ApiResponse` & `GlobalExceptionHandler` dùng chung.
- [x] Spring Security + JWT (filter, token provider, `PasswordEncoder`).
- [x] API `POST /auth/register`, `POST /auth/login`, `GET /users/me`.
- [x] Phân quyền cơ bản: `USER`, `ADMIN`.
- [x] Khởi tạo Next.js + Tailwind, cấu trúc `app/`, `components/`, `lib/`.
- [x] API client (axios), quản lý token, middleware bảo vệ route `/profile`.
- [x] Layout chung: Navbar, Footer, trang chủ.
- [x] Trang Đăng ký / Đăng nhập (validate cơ bản, hiển thị lỗi) + trang Profile.
- [x] Component dùng chung: `Button`, `Input`, `Card`, `Modal`.

### Còn cần làm (theo mốc Thứ 6–7)

- Test API bằng Postman/Swagger, ghi lại danh sách endpoint đầy đủ cho frontend.
- Tích hợp thật giữa FE và BE (đổi dữ liệu giả sang gọi API thật, đã sẵn sàng trong `lib/apiClient.ts`).
- Review code, demo nội bộ.
