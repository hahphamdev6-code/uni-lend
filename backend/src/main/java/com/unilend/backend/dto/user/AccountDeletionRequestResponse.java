package com.unilend.backend.dto.user;

import com.unilend.backend.entity.AccountDeletionRequest;

import java.time.Instant;
import java.util.List;

public record AccountDeletionRequestResponse(
        Long id,
        AccountDeletionRequest.Status status,
        Instant requestedAt,
        Instant confirmationExpiresAt,
        Instant confirmedAt,
        boolean operationalChecksClear,
        List<String> blockers,
        boolean policyApproved,
        boolean anonymizationPermitted
) {
}
