package com.unilend.backend.dto.admin;

import jakarta.validation.constraints.Size;

public record ModerationActionRequest(
        @Size(max = 500, message = "Lý do tối đa 500 ký tự")
        String reason
) {
}