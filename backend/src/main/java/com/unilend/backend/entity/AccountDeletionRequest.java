package com.unilend.backend.entity;

import com.unilend.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "account_deletion_requests", indexes = {
        @Index(name = "uk_account_deletion_active_user", columnList = "active_user_id", unique = true),
        @Index(name = "idx_account_deletion_user_created", columnList = "user_id, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountDeletionRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Non-null only while this request is active; the unique index enforces one per account. */
    @Column(name = "active_user_id", unique = true)
    private Long activeUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Status status;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "confirmation_expires_at", nullable = false)
    private Instant confirmationExpiresAt;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "failed_confirmation_attempts", nullable = false)
    private int failedConfirmationAttempts;

    public enum Status {
        AWAITING_CONFIRMATION,
        CONFIRMED_WAITING_CLEARANCE,
        CANCELLED,
        EXPIRED
    }
}
