package com.unilend.backend.dto.loan;

import com.unilend.backend.entity.LoanIncident.IncidentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record IncidentStatusUpdateRequest(
        @NotNull(message = "Vui lòng chọn trạng thái")
        IncidentStatus status,

        @NotBlank(message = "Nội dung cập nhật không được để trống")
        @Size(max = 1000, message = "Nội dung cập nhật tối đa 1000 ký tự")
        String message
) {
}
