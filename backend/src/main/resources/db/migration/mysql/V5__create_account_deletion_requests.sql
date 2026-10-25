CREATE TABLE account_deletion_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    user_id BIGINT NOT NULL,
    active_user_id BIGINT NULL,
    status VARCHAR(40) NOT NULL,
    requested_at DATETIME(6) NOT NULL,
    confirmation_expires_at DATETIME(6) NOT NULL,
    confirmed_at DATETIME(6) NULL,
    cancelled_at DATETIME(6) NULL,
    failed_confirmation_attempts INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_account_deletion_request_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uk_account_deletion_active_user UNIQUE (active_user_id),
    INDEX idx_account_deletion_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
