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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User recipient;
    private User otherUser;

    @BeforeEach
    void setUp() {
        recipient = User.builder().id(1L).email("user1@unilend.test").fullName("Người dùng 1").build();
        otherUser = User.builder().id(2L).email("user2@unilend.test").fullName("Người dùng 2").build();
    }

    @Test
    void notify_savesNotification() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(recipient));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> {
            Notification n = inv.getArgument(0);
            n.setId(50L);
            return n;
        });

        NotificationResponse res = notificationService.notify(
                1L, NotificationType.LOAN_CREATED, "Có yêu cầu mượn mới", "/loans/10");

        assertEquals(50L, res.id());
        assertEquals(1L, res.userId());
        assertEquals("LOAN_CREATED", res.type());
        assertEquals("Có yêu cầu mượn mới", res.message());
        assertEquals("/loans/10", res.link());
        assertFalse(res.read());
    }

    @Test
    void notify_userNotFound_throwsResourceNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> notificationService.notify(99L, "LOAN_CREATED", "Msg", "/loans/1"));
    }

    @Test
    void getMyNotifications_returnsPagedResults() {
        Notification n = Notification.builder()
                .id(10L)
                .user(recipient)
                .type("LOAN_APPROVED")
                .message("Đã duyệt")
                .link("/loans/5")
                .read(false)
                .build();
        when(notificationRepository.findByUserId(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(n), PageRequest.of(0, 10), 1));

        PageResponse<NotificationResponse> page = notificationService.getMyNotifications(
                recipient, PageRequest.of(0, 10));

        assertEquals(1, page.content().size());
        assertEquals(10L, page.content().get(0).id());
        assertEquals("LOAN_APPROVED", page.content().get(0).type());
    }

    @Test
    void getUnreadCount_returnsRepositoryCount() {
        when(notificationRepository.countByUserIdAndReadFalse(1L)).thenReturn(4L);

        assertEquals(4L, notificationService.getUnreadCount(recipient));
    }

    @Test
    void markAsRead_marksUnreadNotification() {
        Notification n = Notification.builder()
                .id(10L)
                .user(recipient)
                .type("LOAN_APPROVED")
                .message("Đã duyệt")
                .read(false)
                .build();
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationResponse res = notificationService.markAsRead(10L, recipient);

        assertTrue(res.read());
        assertNotNull(res.readAt());
        verify(notificationRepository).save(n);
    }

    @Test
    void markAsRead_otherUsersNotification_forbidden() {
        Notification n = Notification.builder()
                .id(10L)
                .user(recipient)
                .type("LOAN_APPROVED")
                .message("Đã duyệt")
                .read(false)
                .build();
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(n));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> notificationService.markAsRead(10L, otherUser));
        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }

    @Test
    void markAllAsRead_updatesAllForUser() {
        when(notificationRepository.markAllAsRead(eq(1L), any(Instant.class))).thenReturn(3);

        int updated = notificationService.markAllAsRead(recipient);

        assertEquals(3, updated);
        verify(notificationRepository).markAllAsRead(eq(1L), any(Instant.class));
    }
}
