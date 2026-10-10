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
        UserSummary owner
) {

    public record ItemSummary(Long id, String title) {
    }

    public record UserSummary(Long id, String fullName) {
    }

    public static LoanRequestResponse from(LoanRequest loan) {
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
                new UserSummary(borrower.getId(), borrower.getFullName()),
                new UserSummary(owner.getId(), owner.getFullName())
        );
    }
}
