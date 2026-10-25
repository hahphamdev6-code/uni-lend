package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.dto.user.ChangePasswordRequest;
import com.unilend.backend.dto.user.PublicUserProfileResponse;
import com.unilend.backend.dto.user.UpdateProfileRequest;
import com.unilend.backend.dto.user.UserProfileResponse;
import com.unilend.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/users", "/users"})
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMe() {
        return ApiResponse.ok(userService.getMyProfile());
    }

    @GetMapping("/{id}")
    public ApiResponse<PublicUserProfileResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(userService.getById(id));
    }

    @PutMapping("/me")
    public ApiResponse<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest req) {
        return ApiResponse.ok("Cập nhật hồ sơ thành công", userService.updateMyProfile(req));
    }

    @PatchMapping("/me/password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        userService.changeMyPassword(req);
        return ApiResponse.ok("Đổi mật khẩu thành công");
    }
}
