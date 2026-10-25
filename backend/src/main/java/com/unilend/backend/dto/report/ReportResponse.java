package com.unilend.backend.dto.report;

import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.Report;
import com.unilend.backend.entity.Report.ReportReason;
import com.unilend.backend.entity.Report.ReportStatus;
import com.unilend.backend.entity.Report.ReportTargetType;
import com.unilend.backend.entity.User;

import java.time.Instant;

public record ReportResponse(
        Long id,
        ReportTargetType targetType,
        ReportReason reason,
        String description,
        ReportStatus status,
        UserSummary reporter,
        ItemSummary reportedItem,
        UserSummary reportedUser,
        UserSummary resolvedBy,
        String resolutionNote,
        Instant createdAt,
        Instant resolvedAt
) {

    public record UserSummary(Long id, String fullName) {
    }

    public record ItemSummary(Long id, String title) {
    }

    public static ReportResponse from(Report report) {
        User reporter = report.getReporter();
        Item item = report.getReportedItem();
        User targetUser = report.getReportedUser();
        User resolver = report.getResolvedBy();

        return new ReportResponse(
                report.getId(),
                report.getTargetType(),
                report.getReason(),
                report.getDescription(),
                report.getStatus(),
                reporter != null ? new UserSummary(reporter.getId(), reporter.getFullName()) : null,
                item != null ? new ItemSummary(item.getId(), item.getTitle()) : null,
                targetUser != null ? new UserSummary(targetUser.getId(), targetUser.getFullName()) : null,
                resolver != null ? new UserSummary(resolver.getId(), resolver.getFullName()) : null,
                report.getResolutionNote(),
                report.getCreatedAt(),
                report.getResolvedAt()
        );
    }
}