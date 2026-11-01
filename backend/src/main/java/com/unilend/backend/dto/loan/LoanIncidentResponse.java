package com.unilend.backend.dto.loan;

import com.unilend.backend.entity.LoanIncident;
import com.unilend.backend.entity.LoanIncidentUpdate;

import java.time.Instant;
import java.util.List;

public record LoanIncidentResponse(
        Long id,
        Long loanRequestId,
        LoanIncident.IncidentType type,
        String description,
        LoanIncident.IncidentStatus status,
        UserSummary reporter,
        Instant createdAt,
        List<UpdateSummary> updates
) {
    public record UserSummary(Long id, String fullName) {
    }

    public record UpdateSummary(
            Long id,
            LoanIncident.IncidentStatus status,
            String message,
            UserSummary actor,
            Instant createdAt
    ) {
    }

    public static LoanIncidentResponse from(LoanIncident incident) {
        return new LoanIncidentResponse(
                incident.getId(),
                incident.getLoanRequest().getId(),
                incident.getType(),
                incident.getDescription(),
                incident.getStatus(),
                new UserSummary(incident.getReporter().getId(), incident.getReporter().getFullName()),
                incident.getCreatedAt(),
                incident.getUpdates().stream().map(LoanIncidentResponse::from).toList()
        );
    }

    private static UpdateSummary from(LoanIncidentUpdate update) {
        return new UpdateSummary(
                update.getId(),
                update.getStatus(),
                update.getMessage(),
                new UserSummary(update.getActor().getId(), update.getActor().getFullName()),
                update.getCreatedAt()
        );
    }
}
