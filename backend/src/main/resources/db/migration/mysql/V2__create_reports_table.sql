CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    reporter_id BIGINT NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    reported_item_id BIGINT,
    reported_user_id BIGINT,
    reason VARCHAR(30) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    status VARCHAR(20) NOT NULL,
    resolved_by_id BIGINT,
    resolution_note VARCHAR(500),
    resolved_at DATETIME(6),
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id),
    CONSTRAINT fk_reports_reported_item FOREIGN KEY (reported_item_id) REFERENCES items(id),
    CONSTRAINT fk_reports_reported_user FOREIGN KEY (reported_user_id) REFERENCES users(id),
    CONSTRAINT fk_reports_resolved_by FOREIGN KEY (resolved_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reports_status ON reports (status);
CREATE INDEX idx_reports_reporter ON reports (reporter_id);
CREATE INDEX idx_reports_target_type ON reports (target_type);
CREATE INDEX idx_reports_reported_item ON reports (reported_item_id);
CREATE INDEX idx_reports_reported_user ON reports (reported_user_id);
