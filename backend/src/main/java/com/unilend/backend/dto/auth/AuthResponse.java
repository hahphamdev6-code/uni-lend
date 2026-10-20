package com.unilend.backend.dto.auth;

import java.time.Instant;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt
) {
}
