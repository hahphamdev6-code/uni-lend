package com.unilend.backend.dto.issue;

import com.unilend.backend.entity.LoanIssueHistory;
import com.unilend.backend.entity.LoanIssueStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanIssueHistoryResponse {

    private Long id;
    private Long actorId;
    private String actorName;
    private String actorEmail;
    private String action;
    private LoanIssueStatus fromStatus;
    private LoanIssueStatus toStatus;
    private String note;
    private Instant createdAt;

    public static LoanIssueHistoryResponse from(LoanIssueHistory history) {
        if (history == null) return null;
        return LoanIssueHistoryResponse.builder()
                .id(history.getId())
                .actorId(history.getActor() != null ? history.getActor().getId() : null)
                .actorName(history.getActor() != null ? history.getActor().getFullName() : null)
                .actorEmail(history.getActor() != null ? history.getActor().getEmail() : null)
                .action(history.getAction())
                .fromStatus(history.getFromStatus())
                .toStatus(history.getToStatus())
                .note(history.getNote())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
