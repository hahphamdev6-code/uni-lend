package com.unilend.backend.dto.user;

import jakarta.validation.constraints.NotNull;

public record AdminUserStatusRequest(@NotNull Boolean enabled) {
}
