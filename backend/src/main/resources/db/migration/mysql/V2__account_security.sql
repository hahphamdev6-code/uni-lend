-- Account-security entities merged after V1. V1 remains unchanged.
-- Existing accounts remain unverified; token versions start at zero.
ALTER TABLE users ADD COLUMN email_verified BIT(1) NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;

CREATE TABLE account_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    user_id BIGINT NOT NULL,
    type ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET') NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    used_at DATETIME(6),
    CONSTRAINT fk_account_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX idx_account_token_hash ON account_tokens (token_hash);
CREATE INDEX idx_account_token_user_type ON account_tokens (user_id, type);
