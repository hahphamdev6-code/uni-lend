package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.admin.ModerationActionRequest;
import com.unilend.backend.dto.item.ItemResponse;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.Notification.NotificationType;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/admin/items", "/admin/items", "/api/v1/admin/items"})
@RequiredArgsConstructor
public class AdminModerationController {

    private final ItemRepository itemRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    @PatchMapping("/{id}/hide")
    public ApiResponse<ItemResponse> hideItem(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid ModerationActionRequest request) {
        currentUserService.requireAdmin();
        Item item = itemRepository.findWithDetailsById(id)
                .orElseThrow(() -> new com.unilend.backend.common.exception.ResourceNotFoundException("món đồ", id));

        item.setHiddenByAdmin(true);
        item.setModerationReason(request != null ? request.reason() : null);
        item.setStatus(Item.ItemStatus.UNAVAILABLE);
        Item saved = itemRepository.save(item);

        notificationService.notify(
                item.getOwner().getId(),
                NotificationType.SYSTEM,
                "Món đồ \"%s\" của bạn đã bị quản trị viên ẩn do vi phạm nội quy.".formatted(item.getTitle()),
                "/items/" + item.getId()
        );

        return ApiResponse.ok("Đã ẩn tin đăng", ItemResponse.from(saved));
    }

    @PatchMapping("/{id}/restore")
    public ApiResponse<ItemResponse> restoreItem(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid ModerationActionRequest request) {
        currentUserService.requireAdmin();
        Item item = itemRepository.findWithDetailsById(id)
                .orElseThrow(() -> new com.unilend.backend.common.exception.ResourceNotFoundException("món đồ", id));

        item.setHiddenByAdmin(false);
        item.setModerationReason(null);
        if (item.getStatus() == Item.ItemStatus.UNAVAILABLE) {
            item.setStatus(Item.ItemStatus.AVAILABLE);
        }
        Item saved = itemRepository.save(item);

        notificationService.notify(
                item.getOwner().getId(),
                NotificationType.SYSTEM,
                "Món đồ \"%s\" của bạn đã được khôi phục hiển thị.".formatted(item.getTitle()),
                "/items/" + item.getId()
        );

        return ApiResponse.ok("Đã khôi phục tin đăng", ItemResponse.from(saved));
    }
}