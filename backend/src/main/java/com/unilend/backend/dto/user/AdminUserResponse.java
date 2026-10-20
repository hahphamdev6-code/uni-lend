package com.unilend.backend.dto.user;

import com.unilend.backend.entity.User;

import java.time.Instant;
import java.util.List;

public record AdminUserResponse(
        Long id,
        String fullName,
        String email,
        List<String> roles,
        boolean enabled,
        Instant createdAt
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRoles().stream().sorted().toList(),
                user.isEnabled(),
                user.getCreatedAt());
    }
}
