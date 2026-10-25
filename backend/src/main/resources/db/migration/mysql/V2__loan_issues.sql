-- Migration V2: Loan Issues and Issue History
CREATE TABLE loan_issues (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    loan_id BIGINT NOT NULL,
    reported_by_id BIGINT NOT NULL,
    issue_type VARCHAR(30) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    status VARCHAR(30) NOT NULL,
    decision_note VARCHAR(1000),
    resolved_by_id BIGINT,
    resolved_at DATETIME(6),
    closed_at DATETIME(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_loan_issues_loan FOREIGN KEY (loan_id) REFERENCES loan_requests(id),
    CONSTRAINT fk_loan_issues_reporter FOREIGN KEY (reported_by_id) REFERENCES users(id),
    CONSTRAINT fk_loan_issues_resolver FOREIGN KEY (resolved_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_loan_issue_loan ON loan_issues(loan_id);
CREATE INDEX idx_loan_issue_reporter ON loan_issues(reported_by_id);
CREATE INDEX idx_loan_issue_status ON loan_issues(status);

CREATE TABLE loan_issue_histories (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    issue_id BIGINT NOT NULL,
    actor_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    from_status VARCHAR(30),
    to_status VARCHAR(30),
    note VARCHAR(1000),
    CONSTRAINT fk_loan_issue_histories_issue FOREIGN KEY (issue_id) REFERENCES loan_issues(id) ON DELETE CASCADE,
    CONSTRAINT fk_loan_issue_histories_actor FOREIGN KEY (actor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_loan_issue_history_issue ON loan_issue_histories(issue_id);
