package com.unilend.backend.dto.auth;

<<<<<<< HEAD
import java.time.Instant;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt
) {
}
=======
import com.fasterxml.jackson.annotation.JsonInclude;
import com.unilend.backend.entity.User;

import java.util.Set;

/**
 * Thông tin tài khoản + JWT. Với GET /users/me thì token = null (bị ẩn khỏi JSON).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AuthResponse(
        Long id,
        String email,
        String fullName,
        Set<String> roles,
        String tokenType,
        String token
) {

    public static AuthResponse of(User user, String token) {
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                Set.copyOf(user.getRoles()),
                "Bearer",
                token);
    }

    public static AuthResponse of(User user) {
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                Set.copyOf(user.getRoles()),
                null,
                null);
    }
}
>>>>>>> feature/fe-item-manage-pages
