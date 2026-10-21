package com.unilend.backend.dto.item;

import com.unilend.backend.entity.ItemImage;

import java.time.Instant;

public record ItemImageResponse(
        Long id,
        String imageUrl,
        Instant createdAt
) {
    public static ItemImageResponse from(ItemImage img) {
        return new ItemImageResponse(img.getId(), img.getImageUrl(), img.getCreatedAt());
    }
}
