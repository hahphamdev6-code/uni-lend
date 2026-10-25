package com.unilend.backend.dto.admin;

import jakarta.validation.constraints.Size;

public record AdminAccountActionRequest(
        @Size(max = 500, message = "Lý do không được vượt quá 500 ký tự")
        String reason
) {
}
