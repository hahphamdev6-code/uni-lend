package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.dto.admin.ModerationActionRequest;
import com.unilend.backend.dto.item.ItemResponse;
import com.unilend.backend.service.AdminModerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/admin/items", "/admin/items", "/api/v1/admin/items"})
@RequiredArgsConstructor
public class AdminModerationController {

    private final AdminModerationService moderationService;

    @PatchMapping("/{id}/hide")
    public ApiResponse<ItemResponse> hideItem(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid ModerationActionRequest request) {
        return ApiResponse.ok("Đã ẩn tin đăng", moderationService.hideItem(id, request));
    }

    @PatchMapping("/{id}/restore")
    public ApiResponse<ItemResponse> restoreItem(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid ModerationActionRequest request) {
        return ApiResponse.ok("Đã khôi phục tin đăng", moderationService.restoreItem(id, request));
    }
}
