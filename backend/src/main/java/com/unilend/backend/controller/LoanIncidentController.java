package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.loan.IncidentStatusUpdateRequest;
import com.unilend.backend.dto.loan.LoanIncidentResponse;
import com.unilend.backend.service.LoanIncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/incidents", "/incidents"})
@RequiredArgsConstructor
public class LoanIncidentController {

    private final LoanIncidentService loanIncidentService;
    private final CurrentUserService currentUserService;

    @PatchMapping("/{id}/status")
    public ApiResponse<LoanIncidentResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody IncidentStatusUpdateRequest request) {
        return ApiResponse.ok("Đã cập nhật báo cáo sự cố",
                loanIncidentService.updateStatus(id, currentUserService.getCurrentUser(), request));
    }
}
