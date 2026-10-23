package com.unilend.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record VerifyEmailRequest(
        @NotBlank(message = "Token xác minh không được để trống")
        String token
) {
}