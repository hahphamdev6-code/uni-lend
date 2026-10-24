package com.unilend.backend.dto.report;

import com.unilend.backend.entity.Report.ReportReason;
import com.unilend.backend.entity.Report.ReportTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReportCreateRequest(
        ReportTargetType targetType,

        Long targetId,

        Long itemId,

        Long reportedUserId,

        @NotNull(message = "Loại lý do báo cáo không được để trống")
        ReportReason reason,

        @NotBlank(message = "Mô tả chi tiết không được để trống")
        @Size(max = 1000, message = "Mô tả tối đa 1000 ký tự")
        String description
) {
}