package com.unilend.backend.entity;

import lombok.Getter;

@Getter
public enum LoanIssueType {
    DAMAGE("Hư hỏng tài sản"),
    LOST("Mất tài sản"),
    LATE_RETURN("Trả trễ"),
    WRONG_ITEM("Sai đồ hoặc thiếu phụ kiện"),
    OTHER("Khác");

    private final String description;

    LoanIssueType(String description) {
        this.description = description;
    }
}
