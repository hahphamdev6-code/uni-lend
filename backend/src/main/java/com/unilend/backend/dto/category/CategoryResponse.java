package com.unilend.backend.dto.category;

import com.unilend.backend.entity.Category;

import java.time.Instant;

public record CategoryResponse(Long id, String name, String description, Instant createdAt) {

    public static CategoryResponse from(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getCreatedAt());
    }
}
