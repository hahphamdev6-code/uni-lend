package com.unilend.backend.entity;

import com.unilend.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "loan_requests", indexes = {
        @Index(name = "idx_loan_item", columnList = "item_id"),
        @Index(name = "idx_loan_borrower", columnList = "borrower_id"),
        @Index(name = "idx_loan_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
public class LoanRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ToString.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "borrower_id", nullable = false)
    private User borrower;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    @ToString.Include
    private LoanStatus status = LoanStatus.PENDING;

    @Column(name = "borrow_from")
    private LocalDate borrowFrom;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(length = 500)
    private String note;

    @Column(name = "requested_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant requestedAt = Instant.now();

    @Column(name = "responded_at")
    private Instant respondedAt;

    @Column(name = "returned_at")
    private Instant returnedAt;

    public enum LoanStatus {
        PENDING, APPROVED, REJECTED, RETURNED, CANCELLED
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof LoanRequest other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}