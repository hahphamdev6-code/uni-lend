package com.unilend.backend.dto.user;

import com.unilend.backend.entity.User;

import java.time.Instant;
import java.util.Set;

public record UserProfileResponse(
        Long id,
        String email,
        String fullName,
        String phone,
        String university,
        String avatarUrl,
        Set<String> roles,
        boolean enabled,
        Double averageRating,
        Long reviewCount,
        Instant createdAt
) {
    public static UserProfileResponse from(User user, double averageRating, long reviewCount) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getUniversity(),
                user.getAvatarUrl(),
                user.getRoles(),
                user.isEnabled(),
                averageRating,
                reviewCount,
                user.getCreatedAt()
        );
    }

    public static UserProfileResponse from(User user) {
        return from(user, 0.0, 0L);
    }
}
