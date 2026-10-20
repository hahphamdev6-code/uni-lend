package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.dto.notification.NotificationResponse;
import com.unilend.backend.entity.Notification;
import com.unilend.backend.entity.Notification.NotificationType;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.NotificationRepository;
import com.unilend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final int MAX_PAGE_SIZE = 50;

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public NotificationResponse notify(Long userId, NotificationType type, String message, String link) {
        return notify(userId, type != null ? type.name() : NotificationType.SYSTEM.name(), message, link);
    }

    @Transactional
    public NotificationResponse notify(Long userId, String type, String message, String link) {
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        String resolvedType = (type == null || type.isBlank())
                ? NotificationType.SYSTEM.name()
                : type.trim();

        Notification notification = Notification.builder()
                .user(recipient)
                .type(resolvedType)
                .message(message)
                .link(link)
                .read(false)
                .build();

        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(User user, Pageable pageable) {
        Pageable bounded = boundedPageable(pageable);
        Page<Notification> page = notificationRepository.findByUserId(user.getId(), bounded);
        return PageResponse.from(page, NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Bạn không có quyền truy cập thông báo này");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(Instant.now());
            notification = notificationRepository.save(notification);
        }

        return NotificationResponse.from(notification);
    }

    @Transactional
    public int markAllAsRead(User user) {
        return notificationRepository.markAllAsRead(user.getId(), Instant.now());
    }

    private Pageable boundedPageable(Pageable pageable) {
        Sort defaultSort = Sort.by(Sort.Direction.DESC, "createdAt", "id");
        if (pageable == null || !pageable.isPaged()) {
            return PageRequest.of(0, 10, defaultSort);
        }
        int page = Math.max(pageable.getPageNumber(), 0);
        int size = Math.min(Math.max(pageable.getPageSize(), 1), MAX_PAGE_SIZE);
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : defaultSort;
        return PageRequest.of(page, size, sort);
    }
}
