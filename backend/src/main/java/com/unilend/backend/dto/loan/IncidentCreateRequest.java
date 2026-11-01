package com.unilend.backend.dto.loan;

import com.unilend.backend.entity.LoanIncident.IncidentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record IncidentCreateRequest(
        @NotNull(message = "Vui lòng chọn loại sự cố")
        IncidentType type,

        @NotBlank(message = "Mô tả sự cố không được để trống")
        @Size(max = 2000, message = "Mô tả sự cố tối đa 2000 ký tự")
        String description
) {
}
