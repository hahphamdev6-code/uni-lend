package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.dto.user.UserProfileResponse;
import com.unilend.backend.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/admin/users", "/admin/users", "/api/v1/admin/users"})
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ApiResponse<PageResponse<UserProfileResponse>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(adminUserService.findAll(keyword, enabled, page, size));
    }

    @PatchMapping("/{id}/lock")
    public ApiResponse<UserProfileResponse> lock(@PathVariable Long id) {
        return ApiResponse.ok("Đã khóa tài khoản người dùng", adminUserService.lockUser(id));
    }

    @PatchMapping("/{id}/unlock")
    public ApiResponse<UserProfileResponse> unlock(@PathVariable Long id) {
        return ApiResponse.ok("Đã mở khóa tài khoản người dùng", adminUserService.unlockUser(id));
    }
}
