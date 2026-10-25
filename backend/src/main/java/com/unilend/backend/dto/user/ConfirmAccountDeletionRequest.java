package com.unilend.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfirmAccountDeletionRequest(
        @NotBlank @Size(max = 100) String code
) {
}
