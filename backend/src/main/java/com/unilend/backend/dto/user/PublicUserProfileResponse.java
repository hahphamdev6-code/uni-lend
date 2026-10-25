package com.unilend.backend.dto.user;

import com.unilend.backend.entity.User;

public record PublicUserProfileResponse(
        Long id,
        String fullName,
        String avatarUrl,
        double averageRating,
        long reviewCount
) {
    public static PublicUserProfileResponse from(User user, double averageRating, long reviewCount) {
        return new PublicUserProfileResponse(user.getId(), user.getFullName(), user.getAvatarUrl(),
                averageRating, reviewCount);
    }
}
