package com.unilend.backend.dto.notification;

import com.unilend.backend.entity.Notification;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        Long userId,
        String type,
        String message,
        String link,
        boolean read,
        Instant readAt,
        Instant createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUser() != null ? notification.getUser().getId() : null,
                notification.getType(),
                notification.getMessage(),
                notification.getLink(),
                notification.isRead(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}
