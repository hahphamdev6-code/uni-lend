package com.unilend.backend.dto.loan;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record LoanRequestCreateRequest(
        @NotNull(message = "itemId không được để trống")
        Long itemId,

        @NotNull(message = "Ngày bắt đầu mượn không được để trống")
        LocalDate borrowFrom,

        @NotNull(message = "Hạn trả không được để trống")
        LocalDate dueDate,

        @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
        String note
) {
}
