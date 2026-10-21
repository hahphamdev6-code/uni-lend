package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.dto.user.AdminUserResponse;
import com.unilend.backend.dto.user.AdminUserStatusRequest;
import com.unilend.backend.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ApiResponse<PageResponse<AdminUserResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(adminUserService.search(keyword, page, size));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<AdminUserResponse> setStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserStatusRequest request) {
        return ApiResponse.ok(
                "Cập nhật trạng thái tài khoản thành công",
                adminUserService.setEnabled(id, request.enabled()));
    }
}
