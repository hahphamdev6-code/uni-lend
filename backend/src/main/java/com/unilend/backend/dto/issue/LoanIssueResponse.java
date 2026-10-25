package com.unilend.backend.dto.issue;

import com.unilend.backend.entity.LoanIssue;
import com.unilend.backend.entity.LoanIssueStatus;
import com.unilend.backend.entity.LoanIssueType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanIssueResponse {

    private Long id;
    private Long loanId;
    private Long itemId;
    private String itemTitle;
    private Long borrowerId;
    private String borrowerName;
    private Long ownerId;
    private String ownerName;
    private Long reportedById;
    private String reportedByName;
    private String reportedByEmail;
    private LoanIssueType type;
    private String typeDescription;
    private String description;
    private LoanIssueStatus status;
    private String statusDescription;
    private String decisionNote;
    private Long resolvedById;
    private String resolvedByName;
    private Instant resolvedAt;
    private Instant closedAt;
    private Long version;
    private Instant createdAt;
    private Instant updatedAt;
    private List<LoanIssueHistoryResponse> histories;

    public static LoanIssueResponse from(LoanIssue issue) {
        return from(issue, null);
    }

    public static LoanIssueResponse from(LoanIssue issue, List<LoanIssueHistoryResponse> histories) {
        if (issue == null) return null;
        var loan = issue.getLoanRequest();
        var item = loan != null ? loan.getItem() : null;
        var borrower = loan != null ? loan.getBorrower() : null;
        var owner = item != null ? item.getOwner() : null;
        var reporter = issue.getReportedBy();
        var resolver = issue.getResolvedBy();

        return LoanIssueResponse.builder()
                .id(issue.getId())
                .loanId(loan != null ? loan.getId() : null)
                .itemId(item != null ? item.getId() : null)
                .itemTitle(item != null ? item.getTitle() : null)
                .borrowerId(borrower != null ? borrower.getId() : null)
                .borrowerName(borrower != null ? borrower.getFullName() : null)
                .ownerId(owner != null ? owner.getId() : null)
                .ownerName(owner != null ? owner.getFullName() : null)
                .reportedById(reporter != null ? reporter.getId() : null)
                .reportedByName(reporter != null ? reporter.getFullName() : null)
                .reportedByEmail(reporter != null ? reporter.getEmail() : null)
                .type(issue.getType())
                .typeDescription(issue.getType() != null ? issue.getType().getDescription() : null)
                .description(issue.getDescription())
                .status(issue.getStatus())
                .statusDescription(issue.getStatus() != null ? issue.getStatus().getDescription() : null)
                .decisionNote(issue.getDecisionNote())
                .resolvedById(resolver != null ? resolver.getId() : null)
                .resolvedByName(resolver != null ? resolver.getFullName() : null)
                .resolvedAt(issue.getResolvedAt())
                .closedAt(issue.getClosedAt())
                .version(issue.getVersion())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .histories(histories)
                .build();
    }
}
