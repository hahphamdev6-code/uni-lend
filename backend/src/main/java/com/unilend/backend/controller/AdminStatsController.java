package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.admin.AdminStatsResponse;
import com.unilend.backend.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/admin", "/admin"})
@RequiredArgsConstructor
public class AdminStatsController {

    private final CurrentUserService currentUserService;
    private final AdminStatsService adminStatsService;

    @GetMapping("/stats")
    public ApiResponse<AdminStatsResponse> getStats() {
        currentUserService.requireAdmin();
        return ApiResponse.ok(adminStatsService.getStats());
    }
}
