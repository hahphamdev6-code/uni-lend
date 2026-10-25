# Audit log tuần 5

## Phạm vi đã triển khai

- `audit_logs` chỉ lưu `actor_user_id`, action, loại đối tượng, mã đối tượng, lý do và `created_at`.
- Không lưu email, họ tên, mật khẩu, token, nội dung hồ sơ hoặc dữ liệu bí mật khác.
- API xem log: `GET /api/admin/audit-logs?page=0&size=20`; route admin và service đều yêu cầu quyền `ADMIN`.
- Khóa/mở tài khoản ghi `USER_LOCKED` hoặc `USER_UNLOCKED` với actor lấy từ `SecurityContext`.
- Ẩn/khôi phục tin ghi `ITEM_HIDDEN`/`ITEM_RESTORED`; cập nhật trạng thái báo cáo ghi `REPORT_STATUS_UPDATED`.
- Audit kiểm duyệt chỉ lưu lý do cố định, không chép ghi chú tự do của admin; audit báo cáo chỉ lưu chuyển trạng thái, không lưu resolution note.
- Thay đổi tin, báo cáo, audit và thông báo kiểm duyệt cùng transaction; thao tác lặp không tạo audit/thông báo trùng.
- Không ghi audit và không gọi `save` khi thao tác không làm thay đổi trạng thái.
- `AuditLogService.record` yêu cầu transaction đang tồn tại (`MANDATORY`); lỗi ghi audit được ném lên để transaction nghiệp vụ rollback.

## Thứ tự migration

Nhánh hiện tại bắt đầu từ V1. Các nhánh remote đã kiểm tra có thứ tự dự kiến:

1. V1: schema nền tảng.
2. V2: bảng reports (`be-reports`/`be-report-admin-queue`).
3. V3: cột kiểm duyệt item (`be-moderation-actions`).
4. V4: bảng audit logs (phần này).

V4 không sửa V1. Không triển khai V4 riêng trên database chỉ có V1; trước khi chạy môi trường dev/staging phải tích hợp V2 và V3 vào cùng lịch sử migration, kiểm tra Flyway và chỉ chạy migrate một lần. Không repair hoặc bỏ qua migration lỗi.

## Chưa hoàn thành

- Chưa có code/API xử lý sự cố trong workspace/những nhánh remote đã rà soát; chưa thể tích hợp audit sự cố nếu chưa có phụ thuộc nghiệp vụ.
- Yêu cầu xóa/ẩn danh tài khoản vẫn cần nhóm chốt chính sách lưu lịch sử trước khi triển khai.
