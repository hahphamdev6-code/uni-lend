package com.unilend.backend.dto.admin;

import java.util.List;
import java.util.Map;

public record AdminStatsResponse(
        long totalUsers,
        long totalItems,
        Map<String, Long> loansByStatus,
        List<CategoryLoanCount> mostBorrowedCategories
) {
    public record CategoryLoanCount(Long categoryId, String categoryName, long loanCount) {}
}
