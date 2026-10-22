package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.dto.auth.*;
import com.unilend.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping({"/api/v1/auth/register", "/api/auth/register", "/auth/register"})
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse data = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful", data));
    }

    @PostMapping({"/api/v1/auth/login", "/api/auth/login", "/auth/login"})
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful", authService.login(request)));
    }

    @PostMapping({"/api/v1/auth/verify-email", "/api/auth/verify-email", "/auth/verify-email"})
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok(ApiResponse.ok("Xác minh email thành công"));
    }

    @PostMapping({"/api/v1/auth/resend-verification", "/api/auth/resend-verification", "/auth/resend-verification"})
    public ResponseEntity<ApiResponse<Void>> resendVerification(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.resendVerificationEmail(request);
        return ResponseEntity.ok(ApiResponse.ok("Nếu tài khoản tồn tại và chưa xác minh, mã xác minh mới đã được gửi"));
    }

    @PostMapping({"/api/v1/auth/forgot-password", "/api/auth/forgot-password", "/auth/forgot-password"})
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi"));
    }

    @PostMapping({"/api/v1/auth/reset-password", "/api/auth/reset-password", "/auth/reset-password"})
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Đặt lại mật khẩu thành công"));
    }

    @GetMapping("/api/v1/users/me")
    public ResponseEntity<ApiResponse<AuthResponse>> me() {
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser()));
    }
}