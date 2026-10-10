package com.unilend.backend.dto.item;

import com.unilend.backend.entity.Item.ItemStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ItemRequest(
        @NotBlank(message = "Tên món đồ không được để trống")
        @Size(max = 150, message = "Tên món đồ tối đa 150 ký tự")
        String title,

        @Size(max = 5000, message = "Mô tả tối đa 5000 ký tự")
        String description,

        Long categoryId,

        ItemStatus status
) {
}
