package com.unilend.backend.service;

import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.admin.ModerationActionRequest;
import com.unilend.backend.dto.item.ItemResponse;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.Notification.NotificationType;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminModerationService {

    private static final String AUDIT_REASON = "Admin moderation action";

    private final ItemRepository itemRepository;
    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional
    public ItemResponse hideItem(Long itemId, ModerationActionRequest request) {
        User admin = currentUserService.requireAdmin();
        Item item = getItem(itemId);
        if (!item.isHiddenByAdmin()) {
            item.setHiddenByAdmin(true);
            item.setModerationReason(request == null ? null : normalize(request.reason()));
            item.setStatus(Item.ItemStatus.UNAVAILABLE);
            itemRepository.save(item);
            auditLogService.record(admin, "ITEM_HIDDEN", "ITEM", item.getId(), AUDIT_REASON);
            notificationService.notify(item.getOwner().getId(), NotificationType.SYSTEM,
                    "Món đồ \"%s\" của bạn đã bị quản trị viên ẩn do vi phạm nội quy.".formatted(item.getTitle()),
                    "/items/" + item.getId());
        }
        return ItemResponse.from(item);
    }

    @Transactional
    public ItemResponse restoreItem(Long itemId, ModerationActionRequest request) {
        User admin = currentUserService.requireAdmin();
        Item item = getItem(itemId);
        if (item.isHiddenByAdmin()) {
            item.setHiddenByAdmin(false);
            item.setModerationReason(null);
            itemRepository.save(item);
            auditLogService.record(admin, "ITEM_RESTORED", "ITEM", item.getId(), AUDIT_REASON);
            notificationService.notify(item.getOwner().getId(), NotificationType.SYSTEM,
                    "Món đồ \"%s\" của bạn đã được khôi phục hiển thị.".formatted(item.getTitle()),
                    "/items/" + item.getId());
        }
        return ItemResponse.from(item);
    }

    private Item getItem(Long itemId) {
        return itemRepository.findWithDetailsById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("món đồ", itemId));
    }

    private String normalize(String reason) {
        return reason == null || reason.isBlank() ? null : reason.trim();
    }
}
