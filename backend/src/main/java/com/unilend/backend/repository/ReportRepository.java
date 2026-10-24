package com.unilend.backend.repository;

import com.unilend.backend.entity.Report;
import com.unilend.backend.entity.Report.ReportStatus;
import com.unilend.backend.entity.Report.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

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
}