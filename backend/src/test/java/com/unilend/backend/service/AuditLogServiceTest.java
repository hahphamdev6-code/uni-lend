package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.admin.AuditLogResponse;
import com.unilend.backend.entity.AuditLog;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private AuditLogService auditLogService;

    @Test
    void findAllRequiresAdminAndCapsPageSize() {
        when(currentUserService.requireAdmin()).thenThrow(new BusinessException(ErrorCode.FORBIDDEN));

        assertThrows(BusinessException.class, () -> auditLogService.findAll(0, 100));
        verify(auditLogRepository, never()).findAllByOrderByCreatedAtDescIdDesc(any());
    }

    @Test
    void findAllMapsOnlyAuditFields() {
        User admin = User.builder().id(7L).email("admin@example.test").fullName("Admin").build();
        AuditLog log = AuditLog.builder().id(1L).actorUserId(7L).action("USER_LOCKED")
                .targetType("USER").targetId(9L).reason("  policy violation  ").build();
        log.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        when(currentUserService.requireAdmin()).thenReturn(admin);
        when(auditLogRepository.findAllByOrderByCreatedAtDescIdDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(log)));

        PageResponse<AuditLogResponse> response = auditLogService.findAll(-1, 100);

        assertEquals(1, response.content().size());
        assertEquals(7L, response.content().getFirst().actorUserId());
        assertEquals("USER_LOCKED", response.content().getFirst().action());
        assertEquals("USER", response.content().getFirst().targetType());
        assertEquals(9L, response.content().getFirst().targetId());
        assertEquals("  policy violation  ", response.content().getFirst().reason());
        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(auditLogRepository).findAllByOrderByCreatedAtDescIdDesc(pageable.capture());
        assertEquals(50, pageable.getValue().getPageSize());
        assertEquals(0, pageable.getValue().getPageNumber());
    }

    @Test
    void recordDoesNotStorePersonalOrSecretFields() {
        User admin = User.builder().id(7L).email("admin@example.test")
                .password("secret-hash").fullName("Admin").build();
        AuditLog saved = AuditLog.builder().id(1L).build();
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(saved);

        auditLogService.record(admin, "USER_LOCKED", "USER", 9L, "  reason  ");

        ArgumentCaptor<AuditLog> audit = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(audit.capture());
        assertEquals(7L, audit.getValue().getActorUserId());
        assertEquals("reason", audit.getValue().getReason());
        assertEquals("USER_LOCKED", audit.getValue().getAction());
    }
}
