package com.unilend.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "loan_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // Khóa ngoại nối tới bảng users (Ai mượn)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false) // Khóa ngoại nối tới bảng items (Mượn đồ gì)
    private Item item;

    @Column(nullable = false)
    private Integer quantity; // Số lượng mượn

    @Column(nullable = false)
    private LocalDateTime loanDate; // Ngày mượn đồ

    private LocalDateTime returnDate; // Ngày trả đồ thực tế

    @Column(nullable = false, length = 30)
    private String status; // Trạng thái: PENDING (Chờ duyệt), APPROVED (Đã duyệt), REJECTED (Từ chối), RETURNED (Đã trả)
}
