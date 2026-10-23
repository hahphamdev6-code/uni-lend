package com.unilend.backend.dto.auth;

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
        Boolean emailVerified,
        Double averageRating,
        Long reviewCount,
        String tokenType,
        String token
) {

    public static AuthResponse of(User user, String token) {
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                Set.copyOf(user.getRoles()),
                user.isEmailVerified(),
                null,
                null,
                "Bearer",
                token);
    }

    public static AuthResponse of(User user) {
        return of(user, 0.0, 0L);
    }

    public static AuthResponse of(User user, Double averageRating, Long reviewCount) {
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                Set.copyOf(user.getRoles()),
                user.isEmailVerified(),
                averageRating,
                reviewCount,
                null,
                null);
    }
}