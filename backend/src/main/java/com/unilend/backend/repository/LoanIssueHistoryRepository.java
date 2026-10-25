package com.unilend.backend.repository;

import com.unilend.backend.entity.LoanIssueHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanIssueHistoryRepository extends JpaRepository<LoanIssueHistory, Long> {

    List<LoanIssueHistory> findByLoanIssueIdOrderByCreatedAtAsc(Long issueId);
}
