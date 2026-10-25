package com.unilend.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAccountDeletionRequest(
        @NotBlank @Size(max = 100) String currentPassword
) {
}
