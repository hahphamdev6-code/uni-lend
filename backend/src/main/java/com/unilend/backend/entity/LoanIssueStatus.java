package com.unilend.backend.entity;

import lombok.Getter;

@Getter
public enum LoanIssueStatus {
    OPEN("Mới mở"),
    IN_PROGRESS("Đang xử lý"),
    RESOLVED("Đã giải quyết"),
    CLOSED("Đã đóng"),
    REJECTED("Bác bỏ / Từ chối");

    private final String description;

    LoanIssueStatus(String description) {
        this.description = description;
    }
}
