package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.report.ReportCreateRequest;
import com.unilend.backend.dto.report.ReportResponse;
import com.unilend.backend.dto.report.ReportUpdateStatusRequest;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.Report;
import com.unilend.backend.entity.Report.ReportReason;
import com.unilend.backend.entity.Report.ReportStatus;
import com.unilend.backend.entity.Report.ReportTargetType;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.ReportRepository;
import com.unilend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final int MAX_PAGE_SIZE = 50;
    private static final List<ReportStatus> ACTIVE_REPORT_STATUSES =
            List.of(ReportStatus.OPEN, ReportStatus.IN_REVIEW);

    private final ReportRepository reportRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public ReportResponse create(ReportCreateRequest req) {
        User reporter = currentUserService.getCurrentUser();
        TargetResolution target = resolveTarget(req);

        if (target.targetType == ReportTargetType.ITEM) {
            Item item = itemRepository.findWithDetailsById(target.targetId)
                    .orElseThrow(() -> new ResourceNotFoundException("món đồ", target.targetId));
            if (item.getOwner().getId().equals(reporter.getId())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Bạn không thể tự báo cáo món đồ của chính mình");
            }
            if (reportRepository.existsByReporterIdAndTargetTypeAndReportedItemIdAndStatusIn(
                    reporter.getId(), ReportTargetType.ITEM, item.getId(), ACTIVE_REPORT_STATUSES)) {
                throw new BusinessException(ErrorCode.CONFLICT,
                        "Bạn đã có báo cáo đang chờ xử lý cho món đồ này");
            }
            Report report = Report.builder()
                    .reporter(reporter)
                    .targetType(ReportTargetType.ITEM)
                    .reportedItem(item)
                    .reportedUser(item.getOwner())
                    .reason(req.reason())
                    .description(req.description().trim())
                    .status(ReportStatus.OPEN)
                    .build();
            return ReportResponse.from(reportRepository.save(report));
        } else {
            if (target.targetId.equals(reporter.getId())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Bạn không thể tự báo cáo chính mình");
            }
            User reportedUser = userRepository.findById(target.targetId)
                    .orElseThrow(() -> new ResourceNotFoundException("người dùng", target.targetId));
            if (reportRepository.existsByReporterIdAndTargetTypeAndReportedUserIdAndStatusIn(
                    reporter.getId(), ReportTargetType.USER, reportedUser.getId(), ACTIVE_REPORT_STATUSES)) {
                throw new BusinessException(ErrorCode.CONFLICT,
                        "Bạn đã có báo cáo đang chờ xử lý cho người dùng này");
            }
            Report report = Report.builder()
                    .reporter(reporter)
                    .targetType(ReportTargetType.USER)
                    .reportedUser(reportedUser)
                    .reason(req.reason())
                    .description(req.description().trim())
                    .status(ReportStatus.OPEN)
                    .build();
            return ReportResponse.from(reportRepository.save(report));
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportResponse> findAllForAdmin(
            ReportStatus status, ReportTargetType targetType, int page, int size) {
        return findAllForAdmin(status, targetType, null, null, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportResponse> findAllForAdmin(
            ReportStatus status,
            ReportTargetType targetType,
            ReportReason reason,
            String keyword,
            int page,
            int size) {
        currentUserService.requireAdmin();
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        return PageResponse.from(
                reportRepository.searchAdminQueue(status, targetType, reason, kw, pageable(page, size)),
                ReportResponse::from);
    }

    @Transactional(readOnly = true)
    public ReportResponse getByIdForAdmin(Long id) {
        currentUserService.requireAdmin();
        Report report = reportRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("báo cáo", id));
        return ReportResponse.from(report);
    }

    @Transactional
    public ReportResponse updateStatus(Long id, ReportUpdateStatusRequest req) {
        User admin = currentUserService.requireAdmin();
        Report report = reportRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("báo cáo", id));

        report.setStatus(req.status());
        String note = (req.resolutionNote() == null || req.resolutionNote().isBlank())
                ? null
                : req.resolutionNote().trim();
        report.setResolutionNote(note);

        if (req.status() == ReportStatus.RESOLVED || req.status() == ReportStatus.DISMISSED) {
            report.setResolvedBy(admin);
            report.setResolvedAt(Instant.now());
        } else {
            report.setResolvedBy(null);
            report.setResolvedAt(null);
        }

        return ReportResponse.from(reportRepository.save(report));
    }

    private TargetResolution resolveTarget(ReportCreateRequest req) {
        if (req.itemId() != null && req.reportedUserId() != null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Chỉ được chọn báo cáo một tin đăng hoặc một người dùng trong mỗi lần gửi");
        }
        if (req.targetType() == ReportTargetType.ITEM) {
            if (req.reportedUserId() != null
                    || (req.targetId() != null && req.itemId() != null && !req.targetId().equals(req.itemId()))) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Thông tin đối tượng báo cáo tin đăng không hợp lệ");
            }
            Long id = req.targetId() != null ? req.targetId() : req.itemId();
            if (id == null) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Vui lòng cung cấp mã món đồ cần báo cáo");
            }
            return new TargetResolution(ReportTargetType.ITEM, id);
        }
        if (req.targetType() == ReportTargetType.USER) {
            if (req.itemId() != null
                    || (req.targetId() != null && req.reportedUserId() != null
                    && !req.targetId().equals(req.reportedUserId()))) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Thông tin đối tượng báo cáo người dùng không hợp lệ");
            }
            Long id = req.targetId() != null ? req.targetId() : req.reportedUserId();
            if (id == null) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Vui lòng cung cấp mã người dùng cần báo cáo");
            }
            return new TargetResolution(ReportTargetType.USER, id);
        }
        if (req.targetId() != null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Vui lòng chỉ định loại đối tượng báo cáo khi sử dụng mã đối tượng");
        }
        if (req.itemId() != null) {
            return new TargetResolution(ReportTargetType.ITEM, req.itemId());
        }
        if (req.reportedUserId() != null) {
            return new TargetResolution(ReportTargetType.USER, req.reportedUserId());
        }
        throw new BusinessException(ErrorCode.BAD_REQUEST,
                "Vui lòng chỉ định đối tượng báo cáo (tin đăng hoặc người dùng)");
    }

    private Pageable pageable(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
    }

    private record TargetResolution(ReportTargetType targetType, Long targetId) {
    }
}