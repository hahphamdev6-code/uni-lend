package com.unilend.backend.repository;

import com.unilend.backend.entity.LoanRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRequestRepository extends JpaRepository<LoanRequest, Long> {
    List<LoanRequest> findByBorrowerId(Long borrowerId);
    List<LoanRequest> findByItemId(Long itemId);
}
