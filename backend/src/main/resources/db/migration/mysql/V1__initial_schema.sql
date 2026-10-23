-- Initial schema for the entity snapshot supplied in backend.zip.
-- No seed data; no DROP/TRUNCATE; future changes require a new versioned migration.

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    university VARCHAR(150),
    avatar_url VARCHAR(500),
    enabled BIT(1) NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT uk_categories_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    owner_id BIGINT NOT NULL,
    category_id BIGINT,
    status ENUM('AVAILABLE', 'LENT_OUT', 'UNAVAILABLE') NOT NULL,
    CONSTRAINT fk_items_owner FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT fk_items_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE item_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    item_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    CONSTRAINT fk_item_images_item FOREIGN KEY (item_id) REFERENCES items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE loan_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    item_id BIGINT NOT NULL,
    borrower_id BIGINT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'CANCELLED', 'OVERDUE') NOT NULL,
    borrow_from DATE,
    due_date DATE,
    note VARCHAR(500),
    requested_at DATETIME(6) NOT NULL,
    responded_at DATETIME(6),
    returned_at DATETIME(6),
    CONSTRAINT fk_loan_item FOREIGN KEY (item_id) REFERENCES items(id),
    CONSTRAINT fk_loan_borrower FOREIGN KEY (borrower_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message VARCHAR(500) NOT NULL,
    link VARCHAR(255),
    is_read BIT(1) NOT NULL,
    read_at DATETIME(6),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    loan_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    reviewee_id BIGINT NOT NULL,
    rating INTEGER NOT NULL,
    comment VARCHAR(1000),
    CONSTRAINT uk_review_loan_reviewer UNIQUE (loan_id, reviewer_id),
    CONSTRAINT fk_reviews_loan FOREIGN KEY (loan_id) REFERENCES loan_requests(id),
    CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id),
    CONSTRAINT fk_reviews_reviewee FOREIGN KEY (reviewee_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_items_owner ON items (owner_id);
CREATE INDEX idx_items_category ON items (category_id);
CREATE INDEX idx_items_status ON items (status);
CREATE INDEX idx_item_images_item ON item_images (item_id);
CREATE INDEX idx_loan_item ON loan_requests (item_id);
CREATE INDEX idx_loan_borrower ON loan_requests (borrower_id);
CREATE INDEX idx_loan_status ON loan_requests (status);
CREATE INDEX idx_notification_user ON notifications (user_id);
CREATE INDEX idx_notification_user_read ON notifications (user_id, is_read);
CREATE INDEX idx_notification_created_at ON notifications (created_at);
CREATE INDEX idx_review_reviewee ON reviews (reviewee_id);
CREATE INDEX idx_review_loan ON reviews (loan_id);
