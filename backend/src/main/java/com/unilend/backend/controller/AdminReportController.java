package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.dto.report.ReportResponse;
import com.unilend.backend.dto.report.ReportUpdateStatusRequest;
import com.unilend.backend.entity.Report.ReportReason;
import com.unilend.backend.entity.Report.ReportStatus;
import com.unilend.backend.entity.Report.ReportTargetType;
import com.unilend.backend.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/admin/reports", "/admin/reports", "/api/v1/admin/reports"})
@RequiredArgsConstructor
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping
    public ApiResponse<PageResponse<ReportResponse>> list(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) ReportTargetType targetType,
            @RequestParam(required = false) ReportReason reason,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(reportService.findAllForAdmin(status, targetType, reason, keyword, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<ReportResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(reportService.getByIdForAdmin(id));
    }

    @PatchMapping({"/{id}", "/{id}/status"})
    public ApiResponse<ReportResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReportUpdateStatusRequest request) {
        return ApiResponse.ok("Cập nhật trạng thái báo cáo thành công", reportService.updateStatus(id, request));
    }
}