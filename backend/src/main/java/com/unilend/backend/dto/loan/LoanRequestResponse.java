package com.unilend.backend.dto.loan;

import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.LoanRequest;
import com.unilend.backend.entity.LoanRequest.LoanStatus;
import com.unilend.backend.entity.User;

import java.time.Instant;
import java.time.LocalDate;

public record LoanRequestResponse(
        Long id,
        LoanStatus status,
        LocalDate borrowFrom,
        LocalDate dueDate,
        String note,
        Instant requestedAt,
        Instant respondedAt,
        Instant returnedAt,
        ItemSummary item,
        UserSummary borrower,
        UserSummary owner,
        boolean hasReviewed,
        boolean canReview
) {

    public record ItemSummary(Long id, String title) {
    }

    public record UserSummary(Long id, String fullName, String email, String university, String avatarUrl) {
        public UserSummary(Long id, String fullName) {
            this(id, fullName, null, null, null);
        }
    }

    public static LoanRequestResponse from(LoanRequest loan) {
        return from(loan, false, false);
    }

    public static LoanRequestResponse from(LoanRequest loan, boolean hasReviewed, boolean canReview) {
        Item item = loan.getItem();
        User borrower = loan.getBorrower();
        User owner = item.getOwner();
        return new LoanRequestResponse(
                loan.getId(),
                loan.getStatus(),
                loan.getBorrowFrom(),
                loan.getDueDate(),
                loan.getNote(),
                loan.getRequestedAt(),
                loan.getRespondedAt(),
                loan.getReturnedAt(),
                new ItemSummary(item.getId(), item.getTitle()),
                new UserSummary(
                        borrower.getId(),
                        borrower.getFullName(),
                        borrower.getEmail(),
                        borrower.getUniversity(),
                        borrower.getAvatarUrl()
                ),
                new UserSummary(
                        owner.getId(),
                        owner.getFullName(),
                        owner.getEmail(),
                        owner.getUniversity(),
                        owner.getAvatarUrl()
                ),
                hasReviewed,
                canReview
        );
    }
}
