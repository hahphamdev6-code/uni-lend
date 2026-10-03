package com.unilend.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.unilend.backend.entity.LoanRequest;

@Repository
public interface LoanRequestRepository extends JpaRepository<LoanRequest, Long> {
    // Lấy danh sách phiếu mượn của một người dùng cụ thể (Để xem lịch sử mượn đồ)
    List<LoanRequest> findByUserId(Long userId);
    
    // Lấy danh sách phiếu mượn theo trạng thái: PENDING, APPROVED... (Dành cho ADMIN quản lý)
    List<LoanRequest> findByStatus(String status);
}
