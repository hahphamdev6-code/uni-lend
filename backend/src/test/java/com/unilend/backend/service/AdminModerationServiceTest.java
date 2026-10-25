package com.unilend.backend.service;

import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.admin.ModerationActionRequest;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.Notification.NotificationType;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.ItemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminModerationServiceTest {

    @Mock private ItemRepository itemRepository;
    @Mock private CurrentUserService currentUserService;
    @Mock private AuditLogService auditLogService;
    @Mock private NotificationService notificationService;
    @InjectMocks private AdminModerationService moderationService;

    private final User admin = User.builder().id(1L).email("admin@test").fullName("Admin")
            .roles(Set.of("ADMIN")).build();
    private final User owner = User.builder().id(2L).email("owner@test").fullName("Owner").build();

    @Test
    void hideRecordsAuditAndUpdatesItem() {
        Item item = item(false);
        when(currentUserService.requireAdmin()).thenReturn(admin);
        when(itemRepository.findWithDetailsById(10L)).thenReturn(Optional.of(item));

        moderationService.hideItem(10L, new ModerationActionRequest(
                "  user@example.com 0912345678 bearer-secret  "));

        assertEquals(true, item.isHiddenByAdmin());
        assertEquals(Item.ItemStatus.UNAVAILABLE, item.getStatus());
        assertEquals("user@example.com 0912345678 bearer-secret", item.getModerationReason());
        verify(auditLogService).record(admin, "ITEM_HIDDEN", "ITEM", 10L, "Admin moderation action");
        verify(auditLogService, never()).record(admin, "ITEM_HIDDEN", "ITEM", 10L,
                "user@example.com 0912345678 bearer-secret");
        verify(notificationService).notify(any(Long.class), any(NotificationType.class),
                any(String.class), any(String.class));
    }

    @Test
    void repeatedHideDoesNotAuditOrNotifyAgain() {
        Item item = item(true);
        when(currentUserService.requireAdmin()).thenReturn(admin);
        when(itemRepository.findWithDetailsById(10L)).thenReturn(Optional.of(item));

        moderationService.hideItem(10L, new ModerationActionRequest("again"));

        verify(itemRepository, never()).save(any(Item.class));
        verify(auditLogService, never()).record(any(), any(), any(), any(), any());
        verify(notificationService, never()).notify(any(Long.class), any(NotificationType.class),
                any(String.class), any(String.class));
    }

    @Test
    void restoreDoesNotInventAvailableStatus() {
        Item item = item(true);
        item.setStatus(Item.ItemStatus.LENT_OUT);
        when(currentUserService.requireAdmin()).thenReturn(admin);
        when(itemRepository.findWithDetailsById(10L)).thenReturn(Optional.of(item));

        moderationService.restoreItem(10L, new ModerationActionRequest("reviewed"));

        assertEquals(false, item.isHiddenByAdmin());
        assertEquals(Item.ItemStatus.LENT_OUT, item.getStatus());
        verify(auditLogService).record(admin, "ITEM_RESTORED", "ITEM", 10L, "Admin moderation action");
    }

    private Item item(boolean hidden) {
        return Item.builder().id(10L).title("Item").owner(owner).hiddenByAdmin(hidden).build();
    }
}
