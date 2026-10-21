package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.notification.NotificationResponse;
import com.unilend.backend.dto.notification.UnreadCountResponse;
import com.unilend.backend.entity.User;
import com.unilend.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/notifications", "/notifications"})
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ApiResponse<PageResponse<NotificationResponse>> list(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        User currentUser = currentUserService.getCurrentUser();
        return ApiResponse.ok(notificationService.getMyNotifications(currentUser, pageable));
    }

    @GetMapping("/unread-count")
    public ApiResponse<UnreadCountResponse> unreadCount() {
        User currentUser = currentUserService.getCurrentUser();
        long count = notificationService.getUnreadCount(currentUser);
        return ApiResponse.ok(new UnreadCountResponse(count));
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markAsRead(@PathVariable Long id) {
        User currentUser = currentUserService.getCurrentUser();
        return ApiResponse.ok("Đã đánh dấu thông báo là đã đọc",
                notificationService.markAsRead(id, currentUser));
    }

    @PatchMapping("/read-all")
    public ApiResponse<UnreadCountResponse> markAllAsRead() {
        User currentUser = currentUserService.getCurrentUser();
        notificationService.markAllAsRead(currentUser);
        return ApiResponse.ok("Đã đánh dấu tất cả thông báo là đã đọc",
                new UnreadCountResponse(0));
    }
}
