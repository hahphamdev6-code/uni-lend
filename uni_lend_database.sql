-- =============================================================================
-- UniLend - FULL DATABASE & TABLES SETUP + DATA SEED (MySQL 8.0+)
-- =============================================================================
-- Tệp này bao gồm đầy đủ:
--   1. Tạo Database `uni_lend` chuẩn UTF-8
--   2. Cấu trúc toàn bộ bảng chuẩn JPA & Flyway (V1 & V2) của Backend:
--      - `users`, `user_roles`, `account_tokens`
--      - `categories`, `items`, `item_images`
--      - `loan_requests`, `notifications`, `reviews`
--      - `loan_issues`, `loan_issue_histories`
--      - `flyway_schema_history` (Đồng bộ phiên bản Flyway với Spring Boot)
--   3. Dữ liệu mẫu đồng bộ 100% với Frontend Web:
--      - 4 Tài khoản người dùng (Mật khẩu: password123)
--      - 8 Danh mục thiết bị tiêu chuẩn
--      - 15 Thiết bị cho thuê chi tiết kèm hình ảnh
--      - Các đơn mượn mẫu: Chờ duyệt (PENDING), Đang thuê (APPROVED), Đã trả (RETURNED)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `uni_lend`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `uni_lend`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Xóa các bảng cũ nếu tồn tại
DROP TABLE IF EXISTS `loan_issue_histories`;
DROP TABLE IF EXISTS `loan_issues`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `loan_requests`;
DROP TABLE IF EXISTS `item_images`;
DROP TABLE IF EXISTS `items`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `account_tokens`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `flyway_schema_history`;

-- =============================================================================
-- PHẦN 1: CẤU TRÚC BẢNG (CHUẨN SPRING BOOT JPA ENTITIES & FLYWAY V1 + V2)
-- =============================================================================

-- 1. Bảng `users` (Tài khoản người dùng)
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `university` VARCHAR(150) DEFAULT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `enabled` BIT(1) NOT NULL DEFAULT b'1',
  `email_verified` BIT(1) NOT NULL DEFAULT b'1',
  `token_version` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng `user_roles` (Phân quyền người dùng: USER, ADMIN)
CREATE TABLE `user_roles` (
  `user_id` BIGINT NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`user_id`, `role`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng `account_tokens` (Mã xác minh email và đặt lại mật khẩu)
CREATE TABLE `account_tokens` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `user_id` BIGINT NOT NULL,
  `type` VARCHAR(30) NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `expires_at` DATETIME(6) NOT NULL,
  `used_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_account_token_hash` (`token_hash`),
  INDEX `idx_account_token_user_type` (`user_id`, `type`),
  CONSTRAINT `fk_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng `categories` (Danh mục đồ dùng)
CREATE TABLE `categories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng `items` (Thiết bị cho mượn/thuê)
CREATE TABLE `items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `owner_id` BIGINT NOT NULL,
  `category_id` BIGINT DEFAULT NULL,
  `status` ENUM('AVAILABLE', 'LENT_OUT', 'UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
  PRIMARY KEY (`id`),
  INDEX `idx_items_owner` (`owner_id`),
  INDEX `idx_items_category` (`category_id`),
  INDEX `idx_items_status` (`status`),
  CONSTRAINT `fk_items_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_items_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng `item_images` (Hình ảnh thiết bị)
CREATE TABLE `item_images` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `item_id` BIGINT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_item_images_item` (`item_id`),
  CONSTRAINT `fk_item_images_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng `loan_requests` (Yêu cầu & Lịch sử mượn - trả)
CREATE TABLE `loan_requests` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `item_id` BIGINT NOT NULL,
  `borrower_id` BIGINT NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'CANCELLED', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
  `borrow_from` DATE DEFAULT NULL,
  `due_date` DATE DEFAULT NULL,
  `note` VARCHAR(500) DEFAULT NULL,
  `requested_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `responded_at` DATETIME(6) DEFAULT NULL,
  `returned_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_loan_item` (`item_id`),
  INDEX `idx_loan_borrower` (`borrower_id`),
  INDEX `idx_loan_status` (`status`),
  CONSTRAINT `fk_loan_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `fk_loan_borrower` FOREIGN KEY (`borrower_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng `notifications` (Thông báo người dùng)
CREATE TABLE `notifications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `user_id` BIGINT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `message` VARCHAR(500) NOT NULL,
  `link` VARCHAR(255) DEFAULT NULL,
  `is_read` BIT(1) NOT NULL DEFAULT b'0',
  `read_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_user` (`user_id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bảng `reviews` (Đánh giá sau khi trả đồ)
CREATE TABLE `reviews` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `loan_id` BIGINT NOT NULL,
  `reviewer_id` BIGINT NOT NULL,
  `reviewee_id` BIGINT NOT NULL,
  `rating` INT NOT NULL,
  `comment` VARCHAR(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_review_loan_reviewer` (`loan_id`, `reviewer_id`),
  CONSTRAINT `fk_reviews_loan` FOREIGN KEY (`loan_id`) REFERENCES `loan_requests` (`id`),
  CONSTRAINT `fk_reviews_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_reviews_reviewee` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bảng `loan_issues` (Báo cáo sự cố lượt mượn - Migration V2)
CREATE TABLE `loan_issues` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `loan_id` BIGINT NOT NULL,
  `reported_by_id` BIGINT NOT NULL,
  `issue_type` VARCHAR(30) NOT NULL,
  `description` VARCHAR(1000) NOT NULL,
  `status` VARCHAR(30) NOT NULL,
  `decision_note` VARCHAR(1000) DEFAULT NULL,
  `resolved_by_id` BIGINT DEFAULT NULL,
  `resolved_at` DATETIME(6) DEFAULT NULL,
  `closed_at` DATETIME(6) DEFAULT NULL,
  `version` BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_loan_issue_loan` (`loan_id`),
  INDEX `idx_loan_issue_reporter` (`reported_by_id`),
  INDEX `idx_loan_issue_status` (`status`),
  CONSTRAINT `fk_loan_issues_loan` FOREIGN KEY (`loan_id`) REFERENCES `loan_requests` (`id`),
  CONSTRAINT `fk_loan_issues_reporter` FOREIGN KEY (`reported_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_loan_issues_resolver` FOREIGN KEY (`resolved_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Bảng `loan_issue_histories` (Lịch sử xử lý sự cố)
CREATE TABLE `loan_issue_histories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `issue_id` BIGINT NOT NULL,
  `actor_id` BIGINT NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `from_status` VARCHAR(30) DEFAULT NULL,
  `to_status` VARCHAR(30) DEFAULT NULL,
  `note` VARCHAR(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_loan_issue_history_issue` (`issue_id`),
  CONSTRAINT `fk_loan_issue_histories_issue` FOREIGN KEY (`issue_id`) REFERENCES `loan_issues` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_loan_issue_histories_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Bảng `flyway_schema_history` (Đồng bộ Flyway cho Spring Boot)
CREATE TABLE `flyway_schema_history` (
  `installed_rank` INT NOT NULL,
  `version` VARCHAR(50) DEFAULT NULL,
  `description` VARCHAR(200) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `script` VARCHAR(1000) NOT NULL,
  `checksum` INT DEFAULT NULL,
  `installed_by` VARCHAR(100) NOT NULL,
  `installed_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` INT NOT NULL,
  `success` TINYINT(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  INDEX `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `flyway_schema_history` (`installed_rank`, `version`, `description`, `type`, `script`, `checksum`, `installed_by`, `installed_on`, `execution_time`, `success`)
VALUES
  (1, '1', 'initial schema', 'SQL', 'V1__initial_schema.sql', 2141504698, 'root', CURRENT_TIMESTAMP, 15, 1),
  (2, '2', 'loan issues', 'SQL', 'V2__loan_issues.sql', -848835077, 'root', CURRENT_TIMESTAMP, 10, 1)
ON DUPLICATE KEY UPDATE `success` = 1;

-- =============================================================================
-- PHẦN 2: DỮ LIỆU MẪU (SEED DATA ĐỒNG BỘ FRONTEND & BACKEND)
-- =============================================================================

-- 1. Người dùng mẫu (Mật khẩu: password123, mã hóa chuẩn Spring Security BCrypt)
INSERT INTO `users` (`id`, `created_at`, `email`, `password`, `full_name`, `phone`, `university`, `avatar_url`, `enabled`, `email_verified`, `token_version`)
VALUES
  (1, NOW(6), 'elena.rostova@unilend.edu', '$2a$10$4v/bfbWsbLQdUYiOvUrNS./XpqJThPZ.z7Ca6iyAj.Mk4sB1B2s.C', 'Elena Rostova', '0901234567', 'ĐH Bách Khoa TP.HCM', 'https://lh3.googleusercontent.com/aida-public/AB6AXuColqmD0BU0zcxh9H-0BTGrCWP0dwHhhzEy2bDmKlYnoqE4RMeX89Y6mj7f457ncuFPSSv8vgZKvZTuGIyjwDcY0wqWQVnAG7m4pk3h2oK6Vl0s9eSSfPLHeytYpLE_NnNWm_Dz_OJefyOjEV1e1YnDLGIMWMd5yvdcNzDgqzNebbuOOg-EHVN5QNwgym_6suYvPCPh-r6YEhdiTOM8omafSe3V4pS1sSQnPy0YhjVuXMZ09IgHbdfn-w', 1, 1, 0),
  (2, NOW(6), 'alex.morgan@unilend.edu', '$2a$10$4v/bfbWsbLQdUYiOvUrNS./XpqJThPZ.z7Ca6iyAj.Mk4sB1B2s.C', 'Alex Morgan', '0902345678', 'ĐH Khoa Học Tự Nhiên', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5fP1JIrMlUiIkk3Iqk2lHsXZ6ErjEMC42bRCzU2bVysxnDWtM66et8v08R-iir5htXEzbkQb2KTkCLyU-SIi6ssn8B5C4yLqdqCnRUIZCRRamoibNji-i9gd1ATzGsYWYWUa3ynPWsidws6kb7rqbCQjg4Xn2uctM02V5W9Rq1HDRpHOvhh3CYmel5FLjHqseggP2fHiHhuvFOD0GA1jFfXuwcEKRFuyGtzmyfRLkx_VdAzR4OjgeIA', 1, 1, 0),
  (3, NOW(6), 'minh.quan@unilend.edu', '$2a$10$4v/bfbWsbLQdUYiOvUrNS./XpqJThPZ.z7Ca6iyAj.Mk4sB1B2s.C', 'Minh Quân', '0903456789', 'ĐH Sư Phạm Kỹ Thuật', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWkm30Qf3a7nwP6OVXx64XS4TZojn85KCtnA2mAParaJswajsEF979q0KBiDcski1mnM_jX2RnJttgA6MYTwC6fpEY5c0VrwoSZqbSGuHWILzAzVmsHqNDyjJ9OjbaG5k1fQuiDuVEDjEOi5ZOOHtzHtX94u2JhDklFcHH4BRztTHKOaPuHHQW4xJwurgNiMfWWzUw3ZGlclCWEjchuGXNnAfMhQinIIKTpDOe9S4kNUDhvGVf1qWsF-c0t8qF3CDUzoQZJ5qgfcqP', 1, 1, 0),
  (4, NOW(6), 'lan.anh@unilend.edu', '$2a$10$4v/bfbWsbLQdUYiOvUrNS./XpqJThPZ.z7Ca6iyAj.Mk4sB1B2s.C', 'Lan Anh', '0904567890', 'ĐH Quốc Tế (IU - ĐHQG)', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMAl2gePDDvvlMmtpKHAzGRzSl448tz1U7MUfAsUnmQUhgMA8afTY27lTh6fy3m7vc5-hbPKx5qznaNdQYsw4C2MDjagAkT8vG9WhOk0e66FQM2tlWV8bQ3VbLf1uzTy3CqD-bKUKXbwd1t4EQVKootGn93iPYXl3G1Ac9nGSfMuTEu8_iDfYbS2qzTbkUBY46I7RENXh-HSapWq0W0uNzQSByuRvc5pAJMKcpCjWK6mKA12Yi9ICm7FL36UJY0dZJfMXJh2LaVjLD', 1, 1, 0),
  (5, NOW(6), 'hoang.nam@unilend.edu', '$2a$10$4v/bfbWsbLQdUYiOvUrNS./XpqJThPZ.z7Ca6iyAj.Mk4sB1B2s.C', 'Hoàng Nam', '0905678901', 'ĐH Kinh Tế TP.HCM (UEH)', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSiaPwmk4CfVgO-JlBVEyKTPNMreh4g1lM9pqJrjoDgl331_fduxt_lVnZkhnI0NYmNtL9MaWh8B5JVBNaO1ibLKIsrKyrnhC27r5o6TbzKwc6zv3Qi_XDjW9UDYnh6Pg22x0KjqeL8NvOFayER7C3NyroVM9EsKuH_W31re0zHCU0qbybBsJRHt6-MFAyl47zoMv-ENzTQYMJ3G0Y3eFfajDdvHCScGA0pL5eYGKl_8FmvfGbEun_CKr0b01EzJU9UcJJtllzurQO', 1, 1, 0),
  (6, NOW(6), 'tuan.kiet@unilend.edu', '$2a$10$4v/bfbWsbLQdUYiOvUrNS./XpqJThPZ.z7Ca6iyAj.Mk4sB1B2s.C', 'Tuấn Kiệt', '0906789012', 'ĐH Khoa Học Tự Nhiên', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-Wgqs_9Zq6eAIoBwS2cQJ2MFyBi6IBlf8BS5NyPowSgNHROseCS_55ZiVf1g8JdQ801cWDAOEIw-TrjWPBbfclzhH4TdSnBUkN1tRvthbSrYlzuYr8FnrffXyrJS286oOKOJght9tKKi9d8es6E1QEEGrizXBmfpqdgsSYjJsrKP8tBKys2NsMX22eKvYBV5bv3mU9lCFAMqyIl9Va-p18CBOIM_DOu1HLxees3_0c3Q-7k6QDVY9GV1D2cgn9x7jvnMsjMjYk_jt', 1, 1, 0),
  (7, NOW(6), 'minh.anh@unilend.edu', '$2a$10$4v/bfbWsbLQdUYiOvUrNS./XpqJThPZ.z7Ca6iyAj.Mk4sB1B2s.C', 'Minh Anh', '0907890123', 'ĐH Kiến Trúc TP.HCM', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBo2S_mFUP4oBOHHF4kSpGeQ_70K4SR0v_rJpu-CKyOQ3ri4oIchfn_dNkttnEkt6EZAjFGoyKwaXE1RusHcYPVjdaKlBDRXHqPI5Fvi9OtLBOacbMp3AQw-FXFmBWgrWSCgQD22gFKh2H77hwMCHRZupzb4FUBDUbqNbT6mMEmsgaQ05IhZbGYlqIiph4IgJeukoH1hKMTqSbPpJdMverW7uO_umUSaZRJMJeyo1s_9_x_YJ2cx0JV8kpXL28-2D-MJTP6Z0rjSRZC', 1, 1, 0)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `password` = VALUES(`password`), `avatar_url` = VALUES(`avatar_url`), `university` = VALUES(`university`);

-- 2. Phân quyền vai trò
INSERT INTO `user_roles` (`user_id`, `role`)
VALUES
  (1, 'USER'),
  (1, 'ADMIN'),
  (2, 'USER'),
  (3, 'USER'),
  (4, 'USER'),
  (4, 'ADMIN'),
  (5, 'USER'),
  (6, 'USER'),
  (7, 'USER')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- 3. 8 Danh mục đồ dùng tiêu chuẩn (Khớp với Frontend Tab)
INSERT INTO `categories` (`id`, `created_at`, `name`, `description`)
VALUES
  (1, NOW(6), 'Electronics',        'Máy ảnh mirrorless, ống kính cao cấp, laptop đồ họa và thiết bị số'),
  (2, NOW(6), 'Home Appliances',    'Thiết bị gia dụng thông minh, máy hút bụi, máy pha cà phê'),
  (3, NOW(6), 'Furniture',          'Nội thất học tập, bàn ghế công thái học, đèn chống cận'),
  (4, NOW(6), 'Tools & Equipment',  'Máy khoan pin, trạm sạc lưu động và bộ dụng cụ cơ khí kỹ thuật'),
  (5, NOW(6), 'Travel & Outdoor',   'Vali du lịch cao cấp, lều cắm trại và phụ kiện dã ngoại'),
  (6, NOW(6), 'Sports & Fitness',   'Dụng cụ tập thể thao, xe đạp địa hình, đồng hồ GPS chạy trail'),
  (7, NOW(6), 'Events & Party',     'Loa biểu diễn di động, micro thu âm không dây, máy chiếu sự kiện'),
  (8, NOW(6), 'Other Items',        'Bảng vẽ đồ họa Wacom, phụ kiện sáng tạo và thiết bị hỗ trợ học tập')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 4. 16 Thiết bị cho thuê chính chủ đồng nhất (id: 1 -> 16)
INSERT INTO `items` (`id`, `created_at`, `title`, `description`, `owner_id`, `category_id`, `status`)
VALUES
  (1, NOW(6), 'Bộ Máy Ảnh Mirrorless Sony Alpha A7 IV & Lens 24-70mm GM',
   'Máy ảnh Full-Frame 33MP đa dụng hàng đầu cho đồ án nhiếp ảnh, quay MV sinh viên và sự kiện CLB với chuẩn quay 4K 60p 10-bit 4:2:2. Đi kèm vali chống sốc Pelican, 2 pin zin NP-FZ100, sạc nhanh đôi và thẻ nhớ SD 128GB V90 tốc độ cao.',
   1, 1, 'AVAILABLE'),
  (2, NOW(6), 'Apple MacBook Pro 16" M3 Max (64GB RAM / 2TB SSD)',
   'Trạm làm việc di động mạnh mẽ nhất với chip Apple M3 Max (16 nhân CPU, 40 nhân GPU, 64GB Unified RAM). Cực kỳ lý tưởng để dựng phim 8K ProRes, render đồ án kiến trúc 3D Blender/Cinema4D và huấn luyện mô hình AI/Machine Learning trong kỳ đồ án.',
   1, 1, 'AVAILABLE'),
  (3, NOW(6), 'Bộ Máy Khoan & Bắt Vít Không Dây DeWalt 20V MAX XR',
   'Bộ đôi máy khoan động lực và máy bắt vít xung lực không chổi than DeWalt 20V MAX XR, kèm 2 viên pin 5.0Ah dung lượng lớn và bộ 45 mũi khoan/vít Titanium. Phù hợp thi công mô hình kiến trúc, lắp ráp phòng trọ và chế tạo robot.',
   3, 4, 'AVAILABLE'),
  (4, NOW(6), 'Flycam DJI Air 3 Fly More Combo (Kèm Điều Khiển RC 2)',
   'Flycam hệ thống camera kép (ống kính góc rộng 24mm và tele 3x 70mm) hỗ trợ quay 4K/60fps HDR sắc nét, cảm biến tránh vật cản toàn hướng 360 độ và thời lượng bay lên tới 46 phút mỗi viên pin.',
   1, 1, 'AVAILABLE'),
  (5, NOW(6), 'Máy Chiếu Thông Minh XGIMI Horizon Pro 4K UHD',
   'Máy chiếu độ phân giải thực 4K UHD độ sáng cao 1500 ISO Lumens, tích hợp loa kép Harman Kardon 16W và tính năng tự động căn chỉnh vuông hình thông minh. Tuyệt vời cho buổi thuyết trình đồ án, triển lãm nghệ thuật và chiếu phim CLB.',
   5, 7, 'AVAILABLE'),
  (6, NOW(6), 'Máy Hút Bụi Không Dây Dyson V15 Detect Fluffy Optic',
   'Máy hút bụi không dây lực hút siêu mạnh 240AW với đầu hút chiếu tia sáng xanh Fluffy Optic phát hiện bụi mịn vô hình và cảm biến tự điều chỉnh công suất. Rất tiện lợi khi tổng vệ sinh phòng trọ, căn hộ trước khi chuyển nhà hoặc trả phòng.',
   4, 2, 'AVAILABLE'),
  (7, NOW(6), 'Vali Nhôm Cao Cấp Rimowa Original Cabin Silver',
   'Vali xách tay vỏ hợp kim nhôm Anodized chế tác tại Đức. Trang bị hệ thống bánh xe đa hướng Rimowa Multiwheel® siêu mượt, khóa số đôi chuẩn TSA và vách ngăn Flex Divider bảo vệ tuyệt đối thiết bị công nghệ khi đi thi đấu quốc tế hoặc công tác.',
   2, 5, 'AVAILABLE'),
  (8, NOW(6), 'Loa Biểu Diễn Di Động Bose S1 Pro+ Kèm Mic Không Dây',
   'Hệ thống âm thanh biểu diễn di động dùng pin tích hợp bàn mixer kỹ thuật số 3 kênh, màn hình OLED, phát nhạc Bluetooth 5.0 và bộ thu micro/nhạc cụ không dây. Lựa chọn số 1 cho đêm nhạc Acoustic CLB, hội thảo và teambuilding.',
   6, 7, 'AVAILABLE'),
  (9, NOW(6), 'Gimbal Chống Rung Chuyên Nghiệp DJI RS 3 Pro Combo',
   'Gimbal chống rung cánh tay sợi carbon siêu nhẹ chịu tải tới 4.5kg, tích hợp khóa trục tự động, màn hình cảm ứng OLED 1.8 inch và bộ truyền hình ảnh không dây Ronin RavenEye. Tương thích hoàn hảo với Sony A7 IV / FX3.',
   1, 1, 'AVAILABLE'),
  (10, NOW(6), 'Ống Kính Tele Sony FE 70-200mm f/2.8 GM OSS II',
   'Ống kính tele zoom G Master thế hệ thứ 2 nhẹ nhất thế giới (chỉ 1,045g), lấy nét siêu tốc với 4 motor XD Linear và độ nét tuyệt đối trên toàn dải tiêu cự. Lý tưởng để chụp ảnh kỷ yếu, thể thao sân vận động và sự kiện sân khấu.',
   1, 1, 'AVAILABLE'),
  (11, NOW(6), 'Bộ iPad Pro M4 13" OLED 512GB & Apple Pencil Pro',
   'iPad Pro 13 inch trang bị màn hình Ultra Retina XDR Tandem OLED chuẩn màu tuyệt đối, chip Apple M4 siêu mỏng nhẹ, kèm bút Apple Pencil Pro (hỗ trợ cảm biến bóp & phản hồi xúc giác) và bàn phím Magic Keyboard nhôm.',
   7, 1, 'AVAILABLE'),
  (12, NOW(6), 'Trạm Điện Di Động EcoFlow DELTA 2 (1024Wh - Sạc Nhanh)',
   'Trạm điện di động pin LiFePO4 dung lượng 1,024Wh, công suất đầu ra AC 1,800W (X-Boost 2,400W). Cấp nguồn liên tục cho đèn quay phim studio ngoài trời, sạc laptop, flycam hoặc đi cắm trại dã ngoại cuối tuần.',
   3, 4, 'AVAILABLE'),
  (13, NOW(6), 'Máy Pha Cà Phê Espresso Breville Barista Express 870XL',
   'Máy pha cà phê Espresso tích hợp cối xay hạt hình nón bằng thép không gỉ, kiểm soát nhiệt độ điện tử PID và vòi đánh sữa tạo bọt mịn chuẩn Latte Art. Rất được ưa chuộng cho gian hàng gây quỹ CLB, workshop và tiệc trà.',
   4, 2, 'AVAILABLE'),
  (14, NOW(6), 'Ghế Công Thái Học Herman Miller Aeron Remastered (Size B)',
   'Biểu tượng ghế công thái học thế giới với lưới 8Z Pellicle phân bổ áp lực 8 vùng và bộ đỡ cột sống PostureFit SL kép. Giải pháp tuyệt vời để thuê theo tuần/tháng trong mùa chạy deadline khóa luận tốt nghiệp, ôn thi hoặc Hackathon.',
   5, 3, 'AVAILABLE'),
  (15, NOW(6), 'Bộ Đồng Hồ GPS Garmin Fenix 7X Solar & Phụ Kiện Chạy Trail',
   'Đồng hồ thể thao GPS đa băng tần Garmin Fenix 7X Sapphire Solar tích hợp bản đồ địa hình TopoActive Việt Nam, đèn pin LED siêu sáng và thời lượng pin lên đến 28 ngày. Đi kèm vest nước chạy địa hình Salomon 5L và gậy leo núi Carbon.',
   6, 6, 'AVAILABLE'),
  (16, NOW(6), 'Bảng Vẽ Màn Hình Wacom One 13 Touch & Bút Cảm Ứng 4K',
   'Bảng vẽ màn hình cảm ứng 13.3 inch Full HD tương thích Windows, macOS và Android. Hỗ trợ 4,096 mức lực nhấn, cảm ứng nghiêng mượt mà. Tuyệt vời cho sinh viên đồ họa vẽ minh họa, storyboard, làm animation và ghi chú bài giảng chuyên sâu.',
   7, 8, 'AVAILABLE')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `owner_id` = VALUES(`owner_id`), `category_id` = VALUES(`category_id`), `status` = VALUES(`status`);

-- 5. Hình ảnh đại diện & bộ sưu tập chính chủ cho từng sản phẩm
INSERT INTO `item_images` (`id`, `created_at`, `item_id`, `image_url`)
VALUES
  (1, NOW(6), 1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7q3WyHGwQczGxonMteIjyfBaTvXGwDJ_ur1L9QlcuVqfQMusOSmMoMh6XCFl-eIktAvTmqL1dyo8poZ5-A7l0Lk3JPQDWtYtHEfEYPBMLYEn6oClvM8jXwWDzlwxm3ia91lkfK1Khvslbs26LNUy6x9ZNLoI9QiKpX_Zrs-IiprBPs9fCC7PBsZ7UgSIAM9DfzayhJMV3gDlKZ33XixI_cDXpPSYJu7PCqMAW3i_yNiiPOv4IqNbx1A'),
  (2, NOW(6), 2, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDShP6KcUfhQWJUdWdmdlXxbL_s3QfPJI8zDmDMbNum0sJzIWTa4IiKpKSga1Gex9DTPa4Pudj7ENU9jy5M2HsQTrt04z0IexJGx-2TELX0r3hVfYUXyeHdGg2D6B9es_1hZlgR2nEka0nSBrRBLBnCgmeoSMCIrNPmFSkmW1m3pTqU7t_hjgFprO730ZGsEIrSFDiKJYLkmDBhpzMzMXd3jOeUWaOGwZnSOEm9hQGpF27V2VeQ4ou5zw'),
  (3, NOW(6), 2, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD25Po2n_JnCXwtgfZMJclDlZ7pH5gPhtYbdrlJqZdoJxB_2_sBUhOat6o5qHtSUrwzD51BW1QRxaH_QNFzfg9gp7VachHv06df3z4LqTzxwm-HGv6QWm0XvNbHIH1HRRSJiCR91fetTg8LI6Mbt_6OEPFaa_RnyR_6KRzN5hAApVuQ24-PXxBSSB59unpwx6lU2KuhsJJDnIsb1yOa1dEfJRbmIYqFdBPS9ii1z68Ir_5jFbT44fDrfg'),
  (4, NOW(6), 2, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRRqG-9tBSbzdegYbjV6zPg5zacLIpy9S4sLDWfgjSb6UXl7k_c2VjoGwYFfeVZ1d6t8HEh1AJukOfrhISqhiqi9nYMvTCe8EtxF-_QU8Gtnsm6M3wLTfO26PsvA6r3kWK_qYw3iBIOGTFHkVjQsPre-YH3VyeCXGatfY2BpeZVvGA6EcxdA4Qtit1urS3EJJICHDNt4U3j77wpHveG8uOMsmGn3FArPRZ_1KyITDd_VNtfbfAJtsi5Tg-ChhSlnm4m5swGLYzWdxb'),
  (5, NOW(6), 3, 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9DST6SHxcr9eaIO5QBzV0alHUWe0JyVRV3Fqz5nE4K_9qvi61dBXMV8xM8UKRjK63qnTr3EZAz3MZqGUlkc14hF1NLe2CCMui8V3vmZb0zInQULOYIWWKeJbHN-BAr2EPxSTFpYVxbMfCT7d8kV75pPWNe4d0Ftecfagzvz9gayn00Rsl4e_5hbLe39ESd_VciHUB-Q_MVO8AAf7NTcnBNzMcK9pcKDKailJpZSHPTQni38A02QA0NA'),
  (6, NOW(6), 3, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2hT-fpcgGxw44HNj36g8MG3mL9h0lJTJo6Czd-E-7NJXpHL9OIjXLTthXpZ4soBumwHG-BNJt3vKJxetMJDOUvUVHmTEr-2StvAE-jY_NuPtiuUbicWgkIIzzWjsCiNfJkLBDO74t3OcLC6iQ2gyLyzUCW7yuTmH0eqWZCANc4cUKrOnDhD9Ug2a1p-YCCHLT1q7HSDykYNCUW40ILHoUuZP0PV70MqVF97IvzSzcGb9H2s1lRX4uIA'),
  (7, NOW(6), 4, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd5zfYSglIP26Ei380I-MRYnkB99ZXk0cCTrTMUF6GL1grkvJCSCB7BmkE3fdDe_6bLVPKogRlSyYIvcL7CefnMQVb-eKaYEfX4rumQDIg1oRlnJaRuSRCJ1z6OnE1XLl5dJmvHpTiix9w4P0qennAKQa1do9SEm3YAbimHoKMkM2PI49fe1zCWciKLjIETSfSBsVpcjoKq-ig3HiYVslIBwAQq_hoCCGNtW1pC5nXIjIIlRCk_fxlcA'),
  (8, NOW(6), 4, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeXy7y7Z0DF6g-7xhRu1ooDgsqkOUpc_5sa0yj-h8dwM9WL_wW3xFYyr94Vc9GBprxOyN7V5CZuKfzkrqRTdyhJeLe-qCDPVuCw0GVQzld60UW9Gl_UcRGPZts7ON8smmPhTvLpfDQXjeUasXceN6P6ZhGLfUf6AJC_0_qoQeYfeu5pT4L4Ylot8gHDEKMM7TQghrvidhBo6wPHjTlQc1X63CLJo_6evBY0MCSfdXrGht6FKVc0oXqig'),
  (9, NOW(6), 5, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk3YxyUveFWRcLmW_xYQF0Pu3FfaSo9OzB6H09iK5D-xtasfNeuqE8MhUft8668gBTQ42J09oHNd__Ptoa9sN4ieUQd1kchsvG_T4WkZBmKQ_LViN5TnwFalZm0rjwnxBy50pw0akH1bqxO8NXApSkjoW9U7OuJ2RksiPGbcQBPbus8VuIdfUqQAwfm72rI3EotUG6I2xraMyeZjF3LsshzITLjycG93qsbuuE5XcQQOYzjRhvYK6cUw'),
  (10, NOW(6), 5, 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-ElZWWC1As3eTch-qTDHlAqJyB-nffNmW7gku82jRJMCIEwwypkpW0_P2qsnNkYUAcSnQRjspwH4ujzbEItC2vjP4VZrtISOybwkLJijnH1jnfLT8pGGjNAhZUlG11ihVULYd-LFdNrcT-AUiswRI1_AUoPZuSYOX5IjgKGhEXbnLxmyInt_4O8AFmCsnE_LfNl9qbucIkm5WD0yzQOgUwDL556eQQr-ypceAPVD4gYtlq0yUXG6CvQ'),
  (11, NOW(6), 6, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2RyYwpimYSjHZDyDEHNTWUA7E2KQJTHFzpCQPkDglyl2pQU5jIj5ItkuZxiLJVFi9Dq2QEQKO3NP6O9I2DqBf_yQuRMkHlOpM0THX5CqPkemkBWhsIX3J0dr6FAhl1P6K9VOQo3PZfY0K1traSNMDnFUiKFIXOk-qTRSJp8J3oC9uQfOAu3drbhkoHdepgucVXlksnwCjUvpIFXQ27A3PIcIzrP6X0VoaTteCAVgfbGNswPG0BD3yOw'),
  (12, NOW(6), 6, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCurtKTZjtj7Lumn3Zz3kRJPMQ9bU_wY4zxbR9DuQsawAfrv3yTMSUZzkzwE6lWDq1-GxTsrFWMDribBY60a4Idk9RJ5QP9ao5_tWiSYKSNyEIIhl4JgYNOAY94whnbW1zmEBl_OyiVIvAu-fmBccicGjqM9mfWWvanAGWFBJOr4w2VoqF6IdeClRLIYkeqixWT-aAbYv1okE4iVlGZfz7RVU2zrQUh5tOOK05NnzdlX9c2DL-2LhVXeA'),
  (13, NOW(6), 7, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb-XhpbUQUnrJTrpTYxcUjACSvnf7bNOyJyFzOKrmKerDqFk387VLyNSLvlHgGqQSLTf1PJpvSTR9-PR8gyEWVazS9RdyMBtr91sJ_8jVvQiUFVBzISIu69hbcxF0fHF8hHwdWM2U_CrZkVdy0zclt_9HLgidLg7rpHAP6Xxnm6roU8S_tgLA87RgW7PuX0zdOR2XhBpzd2Rl-3S_Pg2OEFIlTFwxikqfrg0l1O5QVg4R_IEGZqpYJWw'),
  (14, NOW(6), 7, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9T62oXmlFWHvlKFmsO1Y7UdACAsYRoSYniUeag3esHZ2AIQaVc0e6MG0yaiiE8XJ1MhpEd1oaVlBg9ZHzXhleB-vtg6ZJbWWx7SqHQfb_0kCeKHZfIdLvdW-VtGkGMEL-hV74f5WWIUgvgWTxuJkt579ktnb4nazKHqhaIumcU4mRb4i1uyyPJ_gl-ALFtIZI3g5AcMVI2J7Hv2vMkG-stiXBC-PanWa1jFcgAuzuHinYXBuyGjLBjA'),
  (15, NOW(6), 7, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHoUZftnrdDNLmj17AWYXJXF_MABejUg2w3d0nOOoLrzhLFVDiK-tEL7NyTqsV2FmL1vLpePH3Rb5sleP1_OM7z-niC1b8PKa_AAmgwsOMU9gAcDMxrqHtyOUNtFRb7j4mVRRCFahMLyoblDJTiI9_jpwfnjCrkJKiAheohbqsPWPy9Vgdbg90AFC4NTJiX7JWAKMA4N0ikPvKuZixkWyVDgv-IPUvlNSzpMcQbOGaeRI-bZ7-8aKrGavRM0Vn4dv9mHW_q5WgrBCW'),
  (16, NOW(6), 8, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrcswAAUQMBjuNfwjhgWG8KxtzUCv2i5kLWA0-z57JkS2NZQZVJKwfCfQgfs20GXxugnWxvL4_OeygSNpx3-ZuoxTiXrxsItAAhYtS4AVmjGIxwu3lBDhtzpJ_nr1RLCIFBR4uR68SyNDJxgzxoskElSztaiH_XXxrkc4XTdljm35I9q_t-mybM_eeO97Sfdnhgg6W-dCaB-tH5SW-y3h9iy71pREYsEuatvHSPbxp4THgFLn9YyJSNg'),
  (17, NOW(6), 8, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5L2saQDx-wQqEAP7Ztff4RfTs3RRhrJiWRJQ_0TXiQukhdXTODsG_uGI7Yva9C04ln8VNdsAf3BtmrdcA1gguHJa-Btthz3j25ur7iZtkTiksWBFA6OGuBVC4n2cvwI2NOd_UcPCsFuht6sCG5-AA4Uv0GkozwG7JHqtIUDCJDd_tL2pgktdHrpBLPVAwGqd3_2Jd2ZfZJ7T9hsCuJ5U4yQpLZg2o8NeNVIO0zmGIHALUuQ4BzuzuHQ'),
  (18, NOW(6), 9, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZLPeyA08PN8tRtBH98U03CxwUI5GNhxmgMSS4zE4JEo8fgCcYWAZaNAOzfRoseGZEBR5OY0mZADH_o_jwRS39Ydoija7eTMVf_izueR4FKmwJ10p-j9Lct_gKr11oApcaJQNx6lj1DYzVJllU8JPrBPLjfxEPtIhGXI3nqO3_4EGiwDbbtWIVqTCEqAGDD1-hvfM1RjAMd4wmN6g4EJQTrVgpG760f_rnzecLj0AZB2JNBxJ_nKpb1w'),
  (19, NOW(6), 9, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHQRsb3RZkL6XKkw0aEnCc9g8oU2SwpqkCJv2p5ViDPPQ1c0e2KWVZx-pzmnXqaK0S00pUfZXXRCOPWrhHhzgDcqb_HC5Y2vf3xi835sgRlRKnMHN2cPhAkYSjktYI8opWat6on8YKkhkr9XmKAOnNMeKttY4XKJV6lCcvjaDk0-jZZnYoYyX_tlzxnJwGFMBOxehOSZOKCN7qen8C-_8osHpBqOvF9qG_S0jZ7CZQH9-EZpCe7TanuQ'),
  (20, NOW(6), 10, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKrdA8avKHz_tDXqLmxuV5afwOc2qlhskexYQ8BdwPuMmmNQes4hw-cl6hfDcZvdlKwH-hGz-Tear5KlcBVq7DhWe8BMctrxt3l2xPvED4I1nbFDuQ2Pui2uoZbFucgF7H-rMbY20wkSIN5verzTmQLQohLDiyO4Q3MOo26EPBktipyCVMP6lmQvOUFpS9uVfvbhFR0vTvf-foVqlZ0nuYEvOKRdctC3RbOX_jNzzOSSb-njMVSlHtbA'),
  (21, NOW(6), 10, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjYuj9A4ZTCS0PGqKKemj2bWfWk6JpRZt5FwtzFCD0vhvf1DddiIURusaDb2tM9nACJVNJ9j4pbWqKNjojIahvtFiY87jipSdTCrzleVqBI5WSJhIEa18s9GvhK7TcL1kz26Y9FLK2XbDwSaRZ_zGmrM1RginHHYTHkQi8L2s6J4ugHGczK-h1l_V_W_4MLqGk_r2L73-DN7_cKOdqq7MIiLNmjMCo_iBMBluEjRdLPIxaiwQQvCXFEw'),
  (22, NOW(6), 11, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=85'),
  (23, NOW(6), 11, 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=1200&q=85'),
  (24, NOW(6), 12, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=85'),
  (25, NOW(6), 12, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYtWyYPAOm9sAbfT4DIOcC5FgB3edzZTKlnvUvJg5xNbQTk2UMqZ1crN3GsnPy0uqMrhf3BKzz6wgr7WV98qK-KqruO1mcb-1-MKv5BaKIILBkVt2QttqzrQ1wZDafuBIKywItVOPY_MZ5fWzMxb18mo-UhibO24690oHTV58m7uzHsQo9-sRXZdGB2xr8EKUWll4RtfeDYizbqw_BWLaqjegRfIXVlv13nR9ujObTIo_ThBAE4AeRQw'),
  (26, NOW(6), 13, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=85'),
  (27, NOW(6), 13, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85'),
  (28, NOW(6), 14, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=85'),
  (29, NOW(6), 14, 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=1200&q=85'),
  (30, NOW(6), 15, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85'),
  (31, NOW(6), 15, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1200&q=85'),
  (32, NOW(6), 16, 'https://images.unsplash.com/photo-1710855253027-8da61120b719?auto=format&fit=crop&w=1200&q=85'),
  (33, NOW(6), 16, 'https://images.unsplash.com/photo-1611241893603-3c359704e0ee?auto=format&fit=crop&w=1200&q=85')
ON DUPLICATE KEY UPDATE `image_url` = VALUES(`image_url`);

-- 6. Các đơn mượn mẫu minh họa luồng Mượn - Trả đồng bộ giữa các tài khoản thật:
--    - Đơn 1: PENDING (Alex Morgan gửi yêu cầu mượn máy ảnh Sony A7 IV của Elena Rostova)
--    - Đơn 2: APPROVED (Alex Morgan đang mượn MacBook Pro 16" của Elena Rostova)
--    - Đơn 3: APPROVED (Minh Quân đang mượn Vali Rimowa của Alex Morgan)
--    - Đơn 4: RETURNED (Elena Rostova đã mượn và hoàn trả Flycam DJI Air 3)
--    - Đơn 5: RETURNED (Tuấn Kiệt đã hoàn tất mượn Máy Hút Bụi Dyson V15 của Lan Anh)
INSERT INTO `loan_requests` (`id`, `created_at`, `item_id`, `borrower_id`, `status`, `borrow_from`, `due_date`, `note`, `requested_at`, `responded_at`, `returned_at`)
VALUES
  (1, NOW(6), 1, 2, 'PENDING',  CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 'Mượn máy ảnh làm đồ án quay phim ngắn. Bàn giao tại Smart Locker Sảnh A.', NOW(6), NULL, NULL),
  (2, NOW(6), 2, 2, 'APPROVED', DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 'Mượn máy MacBook dựng video 4K Premiere. Bàn giao trực tiếp tại Hub B.', DATE_SUB(NOW(6), INTERVAL 2 DAY), DATE_SUB(NOW(6), INTERVAL 2 DAY), NULL),
  (3, NOW(6), 7, 3, 'APPROVED', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), 'Mượn vali cho chuyến đi thực tập nghiên cứu. Bàn giao tại KTX.', DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_SUB(NOW(6), INTERVAL 1 DAY), NULL),
  (4, NOW(6), 4, 1, 'RETURNED', DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 4 DAY), 'Mượn flycam quay giải bóng đá sinh viên. Thiết bị nguyên vẹn.', DATE_SUB(NOW(6), INTERVAL 7 DAY), DATE_SUB(NOW(6), INTERVAL 7 DAY), DATE_SUB(NOW(6), INTERVAL 4 DAY)),
  (5, NOW(6), 6, 6, 'RETURNED', DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), 'Mượn máy hút bụi dọn phòng lab nghiên cứu. Hoàn trả sạch sẽ.', DATE_SUB(NOW(6), INTERVAL 10 DAY), DATE_SUB(NOW(6), INTERVAL 10 DAY), DATE_SUB(NOW(6), INTERVAL 8 DAY))
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 7. Đánh giá cho lượt mượn đã hoàn tất
INSERT INTO `reviews` (`id`, `created_at`, `loan_id`, `reviewer_id`, `reviewee_id`, `rating`, `comment`)
VALUES
  (1, NOW(6), 4, 1, 1, 5, 'Flycam hoạt động cực kỳ mượt mà, pin đầy đủ 100% khi nhận và chủ thiết bị hỗ trợ rất nhiệt tình!'),
  (2, NOW(6), 5, 6, 4, 5, 'Máy hút bụi Dyson dùng rất êm, đầy đủ phụ kiện. Lan Anh hướng dẫn chu đáo.')
ON DUPLICATE KEY UPDATE `comment` = VALUES(`comment`);

-- 8. Thông báo mẫu
INSERT INTO `notifications` (`id`, `created_at`, `user_id`, `type`, `message`, `link`, `is_read`, `read_at`)
VALUES
  (1, NOW(6), 1, 'LOAN_CREATED',  'Alex Morgan đã gửi yêu cầu mượn món đồ "Bộ Máy Ảnh Mirrorless Sony Alpha A7 IV & Lens 24-70mm GM"', '/loans/1', 0, NULL),
  (2, NOW(6), 2, 'LOAN_APPROVED', 'Yêu cầu mượn món đồ "Apple MacBook Pro 16\" M3 Max" của bạn đã được duyệt', '/loans/2', 1, NOW(6)),
  (3, NOW(6), 2, 'LOAN_CREATED',  'Minh Quân đã gửi yêu cầu mượn món đồ "Vali Nhôm Cao Cấp Rimowa Original Cabin Silver"', '/loans/3', 1, NOW(6)),
  (4, NOW(6), 1, 'LOAN_RETURNED', 'Chủ đồ đã xác nhận bạn đã hoàn trả món đồ "Flycam DJI Air 3 Fly More Combo"', '/loans/4', 1, NOW(6))
ON DUPLICATE KEY UPDATE `message` = VALUES(`message`);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- HOÀN TẤT: Toàn bộ bảng, tài khoản, danh mục, sản phẩm và đơn mượn-trả đã sẵn sàng!
-- =============================================================================
