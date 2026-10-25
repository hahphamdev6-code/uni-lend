package com.unilend.backend.repository;

import com.unilend.backend.entity.LoanIssue;
import com.unilend.backend.entity.LoanIssueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanIssueRepository extends JpaRepository<LoanIssue, Long>, JpaSpecificationExecutor<LoanIssue> {

    Page<LoanIssue> findByLoanRequestId(Long loanRequestId, Pageable pageable);

    List<LoanIssue> findByLoanRequestIdOrderByCreatedAtDesc(Long loanRequestId);

    Page<LoanIssue> findByReportedById(Long reporterId, Pageable pageable);

    @Query("SELECT li FROM LoanIssue li " +
           "WHERE li.loanRequest.borrower.id = :userId OR li.loanRequest.item.owner.id = :userId")
    Page<LoanIssue> findByInvolvedUserId(@Param("userId") Long userId, Pageable pageable);

    Page<LoanIssue> findByStatus(LoanIssueStatus status, Pageable pageable);
}
