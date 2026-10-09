package com.unilend.backend.dto.item;

import com.unilend.backend.dto.category.CategoryResponse;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.Item.ItemStatus;

import java.time.Instant;

public record ItemResponse(
        Long id,
        String title,
        String description,
        ItemStatus status,
        OwnerSummary owner,
        CategoryResponse category,
        Instant createdAt
) {

    public record OwnerSummary(Long id, String fullName) {
    }

    public static ItemResponse from(Item i) {
        return new ItemResponse(
                i.getId(),
                i.getTitle(),
                i.getDescription(),
                i.getStatus(),
                new OwnerSummary(i.getOwner().getId(), i.getOwner().getFullName()),
                i.getCategory() == null ? null : CategoryResponse.from(i.getCategory()),
                i.getCreatedAt());
    }
}
