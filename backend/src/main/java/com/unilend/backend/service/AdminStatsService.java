package com.unilend.backend.service;

import com.unilend.backend.dto.admin.AdminStatsResponse;
import com.unilend.backend.dto.admin.AdminStatsResponse.CategoryLoanCount;
import com.unilend.backend.entity.LoanRequest.LoanStatus;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.LoanRequestRepository;
import com.unilend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final LoanRequestRepository loanRequestRepository;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        Map<String, Long> loansByStatus = new LinkedHashMap<>();
        for (LoanStatus status : LoanStatus.values()) {
            loansByStatus.put(status.name(), 0L);
        }
        for (Object[] row : loanRequestRepository.countLoansByStatus()) {
            LoanStatus status = (LoanStatus) row[0];
            loansByStatus.put(status.name(), ((Number) row[1]).longValue());
        }

        List<CategoryLoanCount> categories = new ArrayList<>();
        for (Object[] row : loanRequestRepository.findMostBorrowedCategories(PageRequest.of(0, 5))) {
            categories.add(new CategoryLoanCount(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    ((Number) row[2]).longValue()));
        }
        return new AdminStatsResponse(
                userRepository.count(), itemRepository.count(), loansByStatus, categories);
    }
}
