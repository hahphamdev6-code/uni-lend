package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.issue.*;
import com.unilend.backend.entity.*;
import com.unilend.backend.entity.Notification.NotificationType;
import com.unilend.backend.repository.LoanIssueHistoryRepository;
import com.unilend.backend.repository.LoanIssueRepository;
import com.unilend.backend.repository.LoanRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoanIssueService {

    private static final int MAX_PAGE_SIZE = 50;

    private final LoanIssueRepository loanIssueRepository;
    private final LoanIssueHistoryRepository loanIssueHistoryRepository;
    private final LoanRequestRepository loanRequestRepository;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    @Transactional
    public LoanIssueResponse createIssue(Long loanId, LoanIssueCreateRequest request, User currentUser) {
        LoanRequest loan = loanRequestRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanRequest", loanId));

        Long currentUserId = currentUser.getId();
        boolean isBorrower = currentUserId.equals(loan.getBorrower().getId());
        boolean isOwner = currentUserId.equals(loan.getItem().getOwner().getId());

        if (!isBorrower && !isOwner) {
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "Chỉ người mượn hoặc chủ sở hữu mới có quyền mở sự cố cho lượt mượn này");
        }

        LoanIssue issue = LoanIssue.builder()
                .loanRequest(loan)
                .reportedBy(currentUser)
                .type(request.getType())
                .description(request.getDescription().trim())
                .status(LoanIssueStatus.OPEN)
                .updatedAt(Instant.now())
                .version(0L)
                .build();

        issue = loanIssueRepository.save(issue);

        // Ghi nhận lịch sử khởi tạo
        LoanIssueHistory history = LoanIssueHistory.builder()
                .loanIssue(issue)
                .actor(currentUser)
                .action("CREATED")
                .fromStatus(null)
                .toStatus(LoanIssueStatus.OPEN)
                .note("Khởi tạo sự cố: " + request.getType().getDescription())
                .build();
        loanIssueHistoryRepository.save(history);

        // Gửi notification
        String link = "/loans/" + loan.getId() + "/issues/" + issue.getId();
        if (isBorrower) {
            // Thông báo cho chủ sở hữu
            notificationService.notify(
                    loan.getItem().getOwner().getId(),
                    NotificationType.LOAN_ISSUE_CREATED,
                    "Người mượn " + currentUser.getFullName() + " đã báo cáo sự cố ("
                            + request.getType().getDescription() + ") cho lượt mượn '" + loan.getItem().getTitle() + "'",
                    link
            );
        } else {
            // Thông báo cho người mượn
            notificationService.notify(
                    loan.getBorrower().getId(),
                    NotificationType.LOAN_ISSUE_CREATED,
                    "Chủ sở hữu " + currentUser.getFullName() + " đã báo cáo sự cố ("
                            + request.getType().getDescription() + ") cho lượt mượn '" + loan.getItem().getTitle() + "'",
                    link
            );
        }

        return LoanIssueResponse.from(issue, List.of(LoanIssueHistoryResponse.from(history)));
    }

    @Transactional(readOnly = true)
    public PageResponse<LoanIssueResponse> getIssuesByLoan(Long loanId, User currentUser, Pageable pageable) {
        LoanRequest loan = loanRequestRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanRequest", loanId));

        Long currentUserId = currentUser.getId();
        boolean isBorrower = currentUserId.equals(loan.getBorrower().getId());
        boolean isOwner = currentUserId.equals(loan.getItem().getOwner().getId());
        boolean isAdmin = currentUserService.isAdmin(currentUser);

        if (!isBorrower && !isOwner && !isAdmin) {
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "Bạn không có quyền xem sự cố của lượt mượn này");
        }

        Pageable bounded = boundedPageable(pageable);
        Page<LoanIssue> page = loanIssueRepository.findByLoanRequestId(loanId, bounded);
        return PageResponse.from(page, LoanIssueResponse::from);
    }

    @Transactional(readOnly = true)
    public LoanIssueResponse getIssueById(Long issueId, User currentUser) {
        LoanIssue issue = loanIssueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanIssue", issueId));

        Long currentUserId = currentUser.getId();
        LoanRequest loan = issue.getLoanRequest();
        boolean isBorrower = currentUserId.equals(loan.getBorrower().getId());
        boolean isOwner = currentUserId.equals(loan.getItem().getOwner().getId());
        boolean isAdmin = currentUserService.isAdmin(currentUser);

        if (!isBorrower && !isOwner && !isAdmin) {
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "Bạn không có quyền xem sự cố này");
        }

        List<LoanIssueHistoryResponse> histories = loanIssueHistoryRepository
                .findByLoanIssueIdOrderByCreatedAtAsc(issueId)
                .stream()
                .map(LoanIssueHistoryResponse::from)
                .toList();

        return LoanIssueResponse.from(issue, histories);
    }

    @Transactional(readOnly = true)
    public PageResponse<LoanIssueResponse> getMyIssues(User currentUser, Pageable pageable) {
        Pageable bounded = boundedPageable(pageable);
        Page<LoanIssue> page = loanIssueRepository.findByInvolvedUserId(currentUser.getId(), bounded);
        return PageResponse.from(page, LoanIssueResponse::from);
    }

    @Transactional(readOnly = true)
    public PageResponse<LoanIssueResponse> getAllIssuesForAdmin(LoanIssueStatus status, Pageable pageable, User currentUser) {
        if (!currentUserService.isAdmin(currentUser)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Chỉ quản trị viên mới có quyền xem toàn bộ sự cố");
        }

        Pageable bounded = boundedPageable(pageable);
        Page<LoanIssue> page = (status != null)
                ? loanIssueRepository.findByStatus(status, bounded)
                : loanIssueRepository.findAll(bounded);

        return PageResponse.from(page, LoanIssueResponse::from);
    }

    @Transactional
    public LoanIssueResponse processIssue(Long issueId, LoanIssueProcessRequest request, User currentUser) {
        if (!currentUserService.isAdmin(currentUser)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Chỉ quản trị viên mới có quyền xử lý sự cố");
        }

        LoanIssue issue = loanIssueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanIssue", issueId));

        // Kiểm tra xung đột cập nhật đồng thời (Optimistic concurrency check)
        if (request.getVersion() != null && !request.getVersion().equals(issue.getVersion())) {
            throw new BusinessException(ErrorCode.CONFLICT,
                    "Dữ liệu đã bị cập nhật bởi phiên làm việc khác (xung đột phiên bản). Vui lòng tải lại trang và thử lại.");
        }

        LoanIssueStatus currentStatus = issue.getStatus();
        LoanIssueStatus targetStatus = request.getStatus();

        // Kiểm tra quy tắc chuyển đổi trạng thái (State machine validation)
        validateStatusTransition(currentStatus, targetStatus);

        issue.setStatus(targetStatus);
        if (request.getDecisionNote() != null) {
            issue.setDecisionNote(request.getDecisionNote().trim());
        }

        Instant now = Instant.now();
        issue.setUpdatedAt(now);

        if (targetStatus == LoanIssueStatus.RESOLVED) {
            issue.setResolvedBy(currentUser);
            issue.setResolvedAt(now);
        } else if (targetStatus == LoanIssueStatus.CLOSED) {
            issue.setClosedAt(now);
            if (issue.getResolvedBy() == null) {
                issue.setResolvedBy(currentUser);
            }
        }

        issue = loanIssueRepository.save(issue);

        // Ghi lại lịch sử
        LoanIssueHistory history = LoanIssueHistory.builder()
                .loanIssue(issue)
                .actor(currentUser)
                .action("STATUS_CHANGED")
                .fromStatus(currentStatus)
                .toStatus(targetStatus)
                .note(request.getDecisionNote() != null ? request.getDecisionNote().trim() : null)
                .build();
        loanIssueHistoryRepository.save(history);

        // Gửi notification cho các bên liên quan (người mượn và chủ sở hữu)
        sendProcessNotification(issue, currentStatus, targetStatus);

        List<LoanIssueHistoryResponse> histories = loanIssueHistoryRepository
                .findByLoanIssueIdOrderByCreatedAtAsc(issueId)
                .stream()
                .map(LoanIssueHistoryResponse::from)
                .toList();

        return LoanIssueResponse.from(issue, histories);
    }

    @Transactional
    public LoanIssueResponse updateIssueContent(Long issueId, LoanIssueUpdateRequest request, User currentUser) {
        LoanIssue issue = loanIssueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanIssue", issueId));

        Long currentUserId = currentUser.getId();
        boolean isReporter = currentUserId.equals(issue.getReportedBy().getId());
        boolean isAdmin = currentUserService.isAdmin(currentUser);

        // Kiểm tra quyền khi sự cố đã ở trạng thái CLOSED
        if (issue.getStatus() == LoanIssueStatus.CLOSED) {
            if (!isAdmin) {
                throw new BusinessException(ErrorCode.FORBIDDEN,
                        "Sự cố đã được đóng. Bạn không có quyền chỉnh sửa nội dung lịch sử.");
            }
        } else {
            // Khi chưa CLOSED: chỉ người tạo (khi còn OPEN) hoặc ADMIN mới được sửa
            if (!isReporter && !isAdmin) {
                throw new BusinessException(ErrorCode.FORBIDDEN,
                        "Bạn không có quyền chỉnh sửa nội dung sự cố này");
            }
            if (isReporter && !isAdmin && issue.getStatus() != LoanIssueStatus.OPEN) {
                throw new BusinessException(ErrorCode.FORBIDDEN,
                        "Chỉ có thể chỉnh sửa nội dung khi sự cố đang ở trạng thái OPEN");
            }
        }

        // Kiểm tra optimistic locking nếu client gửi version
        if (request.getVersion() != null && !request.getVersion().equals(issue.getVersion())) {
            throw new BusinessException(ErrorCode.CONFLICT,
                    "Dữ liệu đã bị cập nhật bởi phiên làm việc khác (xung đột phiên bản). Vui lòng tải lại trang và thử lại.");
        }

        boolean changed = false;
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            issue.setDescription(request.getDescription().trim());
            changed = true;
        }
        if (request.getType() != null) {
            issue.setType(request.getType());
            changed = true;
        }

        if (changed) {
            issue.setUpdatedAt(Instant.now());
            issue = loanIssueRepository.save(issue);

            String actionName = (issue.getStatus() == LoanIssueStatus.CLOSED) ? "HISTORY_AMENDED" : "CONTENT_UPDATED";
            LoanIssueHistory history = LoanIssueHistory.builder()
                    .loanIssue(issue)
                    .actor(currentUser)
                    .action(actionName)
                    .fromStatus(issue.getStatus())
                    .toStatus(issue.getStatus())
                    .note("Cập nhật nội dung mô tả bởi " + currentUser.getFullName())
                    .build();
            loanIssueHistoryRepository.save(history);
        }

        List<LoanIssueHistoryResponse> histories = loanIssueHistoryRepository
                .findByLoanIssueIdOrderByCreatedAtAsc(issueId)
                .stream()
                .map(LoanIssueHistoryResponse::from)
                .toList();

        return LoanIssueResponse.from(issue, histories);
    }

    private void validateStatusTransition(LoanIssueStatus current, LoanIssueStatus target) {
        if (current == target) {
            throw new BusinessException(ErrorCode.CONFLICT,
                    "Sự cố đã ở trạng thái " + current.name());
        }

        if (current == LoanIssueStatus.CLOSED) {
            throw new BusinessException(ErrorCode.CONFLICT,
                    "Sự cố đã đóng (CLOSED), không thể chuyển sang trạng thái khác");
        }

        switch (current) {
            case OPEN -> {
                // OPEN -> IN_PROGRESS, RESOLVED, REJECTED, CLOSED
                if (target != LoanIssueStatus.IN_PROGRESS &&
                        target != LoanIssueStatus.RESOLVED &&
                        target != LoanIssueStatus.REJECTED &&
                        target != LoanIssueStatus.CLOSED) {
                    throw new BusinessException(ErrorCode.CONFLICT,
                            "Không thể chuyển trạng thái từ OPEN sang " + target.name());
                }
            }
            case IN_PROGRESS -> {
                // IN_PROGRESS -> RESOLVED, REJECTED, CLOSED (không lùi lại OPEN)
                if (target != LoanIssueStatus.RESOLVED &&
                        target != LoanIssueStatus.REJECTED &&
                        target != LoanIssueStatus.CLOSED) {
                    throw new BusinessException(ErrorCode.CONFLICT,
                            "Không thể chuyển trạng thái từ IN_PROGRESS sang " + target.name());
                }
            }
            case RESOLVED -> {
                // RESOLVED -> CLOSED (hoặc IN_PROGRESS nếu xem xét lại)
                if (target != LoanIssueStatus.CLOSED && target != LoanIssueStatus.IN_PROGRESS) {
                    throw new BusinessException(ErrorCode.CONFLICT,
                            "Không thể chuyển trạng thái từ RESOLVED sang " + target.name());
                }
            }
            case REJECTED -> {
                // REJECTED -> CLOSED (hoặc OPEN nếu mở lại)
                if (target != LoanIssueStatus.CLOSED && target != LoanIssueStatus.OPEN) {
                    throw new BusinessException(ErrorCode.CONFLICT,
                            "Không thể chuyển trạng thái từ REJECTED sang " + target.name());
                }
            }
            default -> throw new BusinessException(ErrorCode.CONFLICT,
                    "Trạng thái hiện tại không hợp lệ");
        }
    }

    private void sendProcessNotification(LoanIssue issue, LoanIssueStatus oldStatus, LoanIssueStatus newStatus) {
        LoanRequest loan = issue.getLoanRequest();
        Long borrowerId = loan.getBorrower().getId();
        Long ownerId = loan.getItem().getOwner().getId();

        String decisionPart = (issue.getDecisionNote() != null && !issue.getDecisionNote().isBlank())
                ? ". Ghi chú: " + issue.getDecisionNote()
                : "";
        String message = "Sự cố #" + issue.getId() + " của lượt mượn '" + loan.getItem().getTitle()
                + "' đã chuyển trạng thái sang " + newStatus.getDescription() + decisionPart;
        String link = "/loans/" + loan.getId() + "/issues/" + issue.getId();

        NotificationType notifType;
        if (newStatus == LoanIssueStatus.RESOLVED) {
            notifType = NotificationType.LOAN_ISSUE_RESOLVED;
        } else if (newStatus == LoanIssueStatus.CLOSED) {
            notifType = NotificationType.LOAN_ISSUE_CLOSED;
        } else {
            notifType = NotificationType.LOAN_ISSUE_UPDATED;
        }

        notificationService.notify(borrowerId, notifType, message, link);
        if (!ownerId.equals(borrowerId)) {
            notificationService.notify(ownerId, notifType, message, link);
        }
    }

    private Pageable boundedPageable(Pageable pageable) {
        Sort defaultSort = Sort.by(Sort.Direction.DESC, "createdAt", "id");
        if (pageable == null || !pageable.isPaged()) {
            return PageRequest.of(0, 10, defaultSort);
        }
        int page = Math.max(pageable.getPageNumber(), 0);
        int size = Math.min(Math.max(pageable.getPageSize(), 1), MAX_PAGE_SIZE);
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : defaultSort;
        return PageRequest.of(page, size, sort);
    }
}
