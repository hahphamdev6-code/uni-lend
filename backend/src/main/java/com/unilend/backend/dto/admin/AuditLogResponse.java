package com.unilend.backend.dto.admin;

import com.unilend.backend.entity.AuditLog;

import java.time.Instant;

public record AuditLogResponse(
        Long id,
        Long actorUserId,
        String action,
        String targetType,
        Long targetId,
        String reason,
        Instant createdAt
) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActorUserId(),
                log.getAction(),
                log.getTargetType(),
                log.getTargetId(),
                log.getReason(),
                log.getCreatedAt());
    }
}
