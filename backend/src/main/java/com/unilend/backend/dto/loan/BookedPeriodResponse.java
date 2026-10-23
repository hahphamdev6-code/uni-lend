package com.unilend.backend.dto.loan;

import com.unilend.backend.entity.LoanRequest;
import com.unilend.backend.entity.LoanRequest.LoanStatus;

import java.time.LocalDate;

public record BookedPeriodResponse(
        Long loanId,
        LocalDate borrowFrom,
        LocalDate dueDate,
        LoanStatus status
) {
    public static BookedPeriodResponse from(LoanRequest loan) {
        return new BookedPeriodResponse(
                loan.getId(),
                loan.getBorrowFrom(),
                loan.getDueDate(),
                loan.getStatus()
        );
    }
}
