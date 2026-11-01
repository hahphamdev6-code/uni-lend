package com.unilend.backend.dto.item;

import com.unilend.backend.dto.category.CategoryResponse;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.Item.ItemStatus;
import com.unilend.backend.entity.ItemImage;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

public record ItemResponse(
        Long id,
        String title,
        String description,
        ItemStatus status,
        OwnerSummary owner,
        CategoryResponse category,
        List<String> imageUrls,
        List<ItemImageResponse> images,
        Instant createdAt
) {

    public record OwnerSummary(Long id, String fullName, String email, String university, String avatarUrl) {
        public OwnerSummary(Long id, String fullName) {
            this(id, fullName, null, null, null);
        }
    }

    public static ItemResponse from(Item i) {
        List<ItemImage> rawImages = i.getImages() == null ? Collections.emptyList() : i.getImages();
        List<String> urls = rawImages.stream()
                .map(ItemImage::getImageUrl)
                .toList();
        List<ItemImageResponse> imageDtos = rawImages.stream()
                .map(ItemImageResponse::from)
                .toList();

        return new ItemResponse(
                i.getId(),
                i.getTitle(),
                i.getDescription(),
                i.getStatus(),
                new OwnerSummary(
                        i.getOwner().getId(),
                        i.getOwner().getFullName(),
                        i.getOwner().getEmail(),
                        i.getOwner().getUniversity(),
                        i.getOwner().getAvatarUrl()
                ),
                i.getCategory() == null ? null : CategoryResponse.from(i.getCategory()),
                urls,
                imageDtos,
                i.getCreatedAt());
    }
}
