package com.unilend.backend.dto.report;

import com.unilend.backend.entity.Report.ReportStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReportUpdateStatusRequest(
        @NotNull(message = "Trạng thái xử lý không được để trống")
        ReportStatus status,

        @Size(max = 500, message = "Ghi chú xử lý tối đa 500 ký tự")
        String resolutionNote
) {
}