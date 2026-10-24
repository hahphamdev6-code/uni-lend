package com.unilend.backend.repository;

import com.unilend.backend.entity.Report;
import com.unilend.backend.entity.Report.ReportReason;
import com.unilend.backend.entity.Report.ReportStatus;
import com.unilend.backend.entity.Report.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Long> {

    @EntityGraph(attributePaths = {"reporter", "reportedItem", "reportedUser", "resolvedBy"})
    Optional<Report> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"reporter", "reportedItem", "reportedUser", "resolvedBy"})
    Page<Report> findAllBy(Pageable pageable);

    @EntityGraph(attributePaths = {"reporter", "reportedItem", "reportedUser", "resolvedBy"})
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"reporter", "reportedItem", "reportedUser", "resolvedBy"})
    Page<Report> findByTargetType(ReportTargetType targetType, Pageable pageable);

    @EntityGraph(attributePaths = {"reporter", "reportedItem", "reportedUser", "resolvedBy"})
    Page<Report> findByStatusAndTargetType(ReportStatus status, ReportTargetType targetType, Pageable pageable);

    boolean existsByReporterIdAndTargetTypeAndReportedItemIdAndStatusIn(
            Long reporterId, ReportTargetType targetType, Long itemId, Collection<ReportStatus> statuses);

    boolean existsByReporterIdAndTargetTypeAndReportedUserIdAndStatusIn(
            Long reporterId, ReportTargetType targetType, Long userId, Collection<ReportStatus> statuses);

    @EntityGraph(attributePaths = {"reporter", "reportedItem", "reportedUser", "resolvedBy"})
    @Query("""
            SELECT r FROM Report r
            LEFT JOIN r.reportedItem ri
            LEFT JOIN r.reportedUser ru
            JOIN r.reporter rep
            WHERE (:status IS NULL OR r.status = :status)
              AND (:targetType IS NULL OR r.targetType = :targetType)
              AND (:reason IS NULL OR r.reason = :reason)
              AND (:keyword IS NULL
                   OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(ri.title, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(ru.fullName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(rep.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<Report> searchAdminQueue(
            @Param("status") ReportStatus status,
            @Param("targetType") ReportTargetType targetType,
            @Param("reason") ReportReason reason,
            @Param("keyword") String keyword,
            Pageable pageable);
}