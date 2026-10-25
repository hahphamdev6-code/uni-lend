package com.unilend.backend.service;

import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.admin.AuditLogResponse;
import com.unilend.backend.entity.AuditLog;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private static final int MAX_PAGE_SIZE = 50;

    private final AuditLogRepository auditLogRepository;
    private final CurrentUserService currentUserService;

    /**
     * Persists only identifiers and an operator-provided reason. The caller's
     * transaction is deliberately allowed to fail if this insert fails.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public AuditLog record(User actor, String action, String targetType, Long targetId, String reason) {
        String normalizedReason = reason == null || reason.isBlank() ? null : reason.trim();
        return auditLogRepository.save(AuditLog.builder()
                .actorUserId(actor.getId())
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .reason(normalizedReason)
                .build());
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> findAll(int page, int size) {
        currentUserService.requireAdmin();
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return PageResponse.from(auditLogRepository.findAllByOrderByCreatedAtDescIdDesc(pageable),
                AuditLogResponse::from);
    }
}
