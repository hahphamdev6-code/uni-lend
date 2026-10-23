package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.dto.loan.BookedPeriodResponse;
import com.unilend.backend.dto.loan.LoanRequestCreateRequest;
import com.unilend.backend.dto.loan.LoanRequestResponse;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.Item.ItemStatus;
import com.unilend.backend.entity.LoanRequest;
import com.unilend.backend.entity.LoanRequest.LoanStatus;
import com.unilend.backend.entity.Notification.NotificationType;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.LoanRequestRepository;
import com.unilend.backend.repository.ReviewRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class LoanRequestService {

    private static final int MAX_PAGE_SIZE = 50;
    public static final ZoneId LOAN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final LoanRequestRepository loanRequestRepository;
    private final ItemRepository itemRepository;
    private final ReviewRepository reviewRepository;
    private final EntityManager entityManager;
    private final NotificationService notificationService;

    @Transactional
    public LoanRequestResponse create(User borrower, LoanRequestCreateRequest req) {
        validateLoanDates(req.borrowFrom(), req.dueDate());

        Item lockedItem = entityManager.find(Item.class, req.itemId(), LockModeType.PESSIMISTIC_WRITE);
        if (lockedItem == null) {
            throw new ResourceNotFoundException("Item", req.itemId());
        }

        Item item = itemRepository.findWithDetailsById(req.itemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item", req.itemId()));

        if (item.getOwner().getId().equals(borrower.getId())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Bạn không thể mượn đồ của chính mình");
        }
        if (item.getStatus() == ItemStatus.UNAVAILABLE) {
            throw new BusinessException(ErrorCode.CONFLICT, "Món đồ hiện không sẵn sàng để mượn");
        }
        LocalDate today = LocalDate.now(LOAN_ZONE);
        if (item.getStatus() == ItemStatus.LENT_OUT && !req.borrowFrom().isAfter(today)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Món đồ hiện không sẵn sàng để mượn");
        }
        if (loanRequestRepository.existsByItemIdAndBorrowerIdAndStatus(
                item.getId(), borrower.getId(), LoanStatus.PENDING)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Bạn đã có yêu cầu đang chờ duyệt cho món đồ này");
        }
        if (loanRequestRepository.existsOverlappingApproved(item.getId(), req.borrowFrom(), req.dueDate())) {
            throw new BusinessException(ErrorCode.CONFLICT, "Món đồ đã có người mượn trong khoảng thời gian này");
        }

        LoanRequest loan = LoanRequest.builder()
                .item(item)
                .borrower(borrower)
                .borrowFrom(req.borrowFrom())
                .dueDate(req.dueDate())
                .note(req.note())
                .build();

        LoanRequest saved = loanRequestRepository.save(loan);
        notificationService.notify(
                item.getOwner().getId(),
                NotificationType.LOAN_CREATED,
                "%s đã gửi yêu cầu mượn món đồ \"%s\"".formatted(borrower.getFullName(), item.getTitle()),
                "/loans/" + saved.getId()
        );
        return LoanRequestResponse.from(saved);
    }

    @Transactional
    public LoanRequestResponse approve(Long loanId, User actor) {
        LoanRequest peekLoan = findLoan(loanId);
        requireOwner(peekLoan, actor);

        // Khóa theo thứ tự Item -> LoanRequest để chống deadlock và tuần tự hóa mọi thao tác duyệt trên cùng món đồ
        Item item = peekLoan.getItem();
        lockAndRefresh(item);

        LoanRequest loan = findLoanForUpdate(loanId);
        requireOwner(loan, actor);
        requirePending(loan);

        if (item.getStatus() == ItemStatus.UNAVAILABLE) {
            throw new BusinessException(ErrorCode.CONFLICT, "Món đồ hiện không sẵn sàng để cho mượn");
        }
        LocalDate today = LocalDate.now(LOAN_ZONE);
        if (item.getStatus() == ItemStatus.LENT_OUT && !loan.getBorrowFrom().isAfter(today)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Món đồ hiện không sẵn sàng để cho mượn");
        }
        if (loanRequestRepository.existsOverlappingApproved(item.getId(), loan.getBorrowFrom(), loan.getDueDate())) {
            throw new BusinessException(ErrorCode.CONFLICT, "Món đồ đã có người mượn trong khoảng thời gian này");
        }

        Instant respondedAt = Instant.now();
        loan.setStatus(LoanStatus.APPROVED);
        loan.setRespondedAt(respondedAt);
        if (isPeriodActive(loan.getBorrowFrom(), loan.getDueDate(), today)) {
            item.setStatus(ItemStatus.LENT_OUT);
        }

        // Tự động từ chối các yêu cầu đang chờ duyệt (PENDING) bị trùng lịch
        List<LoanRequest> conflictingPendings = loanRequestRepository.findOverlappingPendingForUpdate(
                item.getId(), loan.getId(), loan.getBorrowFrom(), loan.getDueDate());
        if (conflictingPendings != null) {
            for (LoanRequest pending : conflictingPendings) {
                pending.setStatus(LoanStatus.REJECTED);
                pending.setRespondedAt(respondedAt);
                notificationService.notify(
                        pending.getBorrower().getId(),
                        NotificationType.LOAN_REJECTED,
                        "Yêu cầu mượn món đồ \"%s\" của bạn đã bị từ chối do trùng lịch với lượt mượn khác"
                                .formatted(item.getTitle()),
                        "/loans/" + pending.getId()
                );
            }
        }

        notificationService.notify(
                loan.getBorrower().getId(),
                NotificationType.LOAN_APPROVED,
                "Yêu cầu mượn món đồ \"%s\" của bạn đã được duyệt".formatted(item.getTitle()),
                "/loans/" + loan.getId()
        );
        return LoanRequestResponse.from(loan);
    }

    @Transactional
    public LoanRequestResponse reject(Long loanId, User actor) {
        LoanRequest loan = findLoanForUpdate(loanId);
        requireOwner(loan, actor);
        requirePending(loan);

        loan.setStatus(LoanStatus.REJECTED);
        loan.setRespondedAt(Instant.now());

        notificationService.notify(
                loan.getBorrower().getId(),
                NotificationType.LOAN_REJECTED,
                "Yêu cầu mượn món đồ \"%s\" của bạn đã bị từ chối".formatted(loan.getItem().getTitle()),
                "/loans/" + loan.getId()
        );
        return LoanRequestResponse.from(loan);
    }

    @Transactional
    public LoanRequestResponse cancel(Long loanId, User actor) {
        LoanRequest loan = findLoanForUpdate(loanId);
        requireBorrower(loan, actor);
        requirePending(loan);

        loan.setStatus(LoanStatus.CANCELLED);

        notificationService.notify(
                loan.getItem().getOwner().getId(),
                NotificationType.LOAN_CANCELLED,
                "%s đã hủy yêu cầu mượn món đồ \"%s\"".formatted(loan.getBorrower().getFullName(), loan.getItem().getTitle()),
                "/loans/" + loan.getId()
        );
        return LoanRequestResponse.from(loan);
    }

    @Transactional
    public LoanRequestResponse markReturned(Long loanId, User actor) {
        LoanRequest loan = findLoanForUpdate(loanId);
        requireOwner(loan, actor);
        if (loan.getStatus() != LoanStatus.APPROVED && loan.getStatus() != LoanStatus.OVERDUE) {
            throw new BusinessException(ErrorCode.CONFLICT, "Chỉ xác nhận trả được với khoản mượn đã duyệt");
        }

        Item item = loan.getItem();
        lockAndRefresh(item);

        loan.setStatus(LoanStatus.RETURNED);
        loan.setReturnedAt(Instant.now());
        LocalDate today = LocalDate.now(LOAN_ZONE);
        if (item.getStatus() == ItemStatus.LENT_OUT
                && !loanRequestRepository.existsActiveLoanOnDate(item.getId(), today)) {
            item.setStatus(ItemStatus.AVAILABLE);
        }

        notificationService.notify(
                loan.getBorrower().getId(),
                NotificationType.LOAN_RETURNED,
                "Chủ đồ đã xác nhận bạn đã trả món đồ \"%s\"".formatted(item.getTitle()),
                "/loans/" + loan.getId()
        );
        return toResponse(loan, actor);
    }

    @Transactional(readOnly = true)
    public PageResponse<LoanRequestResponse> getMyRequests(User borrower, LoanStatus status, Pageable pageable) {
        Pageable boundedPageable = boundedPageable(pageable);
        Page<LoanRequest> page = (status == null)
                ? loanRequestRepository.findByBorrowerId(borrower.getId(), boundedPageable)
                : loanRequestRepository.findByBorrowerIdAndStatus(borrower.getId(), status, boundedPageable);
        return toPageResponse(page, borrower);
    }

    @Transactional(readOnly = true)
    public PageResponse<LoanRequestResponse> getIncomingRequests(User owner, LoanStatus status, Pageable pageable) {
        Pageable boundedPageable = boundedPageable(pageable);
        Page<LoanRequest> page = (status == null)
                ? loanRequestRepository.findByItemOwnerId(owner.getId(), boundedPageable)
                : loanRequestRepository.findByItemOwnerIdAndStatus(owner.getId(), status, boundedPageable);
        return toPageResponse(page, owner);
    }

    // Khoảng ngày lọc theo requestedAt, gồm cả ngày kết thúc tại múi giờ Việt Nam.
    @Transactional(readOnly = true)
    public PageResponse<LoanRequestResponse> getMyHistory(
            User borrower, LoanStatus status, LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        validateHistoryRange(fromDate, toDate);
        Page<LoanRequest> page = loanRequestRepository.findBorrowerHistory(
                borrower.getId(), status, historyStart(fromDate), historyEndExclusive(toDate),
                boundedPageable(pageable));
        return toPageResponse(page, borrower);
    }

    @Transactional(readOnly = true)
    public PageResponse<LoanRequestResponse> getIncomingHistory(
            User owner, LoanStatus status, LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        validateHistoryRange(fromDate, toDate);
        Page<LoanRequest> page = loanRequestRepository.findOwnerHistory(
                owner.getId(), status, historyStart(fromDate), historyEndExclusive(toDate),
                boundedPageable(pageable));
        return toPageResponse(page, owner);
    }

    @Transactional(readOnly = true)
    public List<BookedPeriodResponse> getBookedPeriods(Long itemId) {
        if (!itemRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("Item", itemId);
        }
        LocalDate today = LocalDate.now(LOAN_ZONE);
        return loanRequestRepository.findActiveOrUpcomingApprovedByItemId(itemId, today).stream()
                .map(BookedPeriodResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LoanRequestResponse> getApprovedScheduleForItem(
            Long itemId, User actor, LocalDate fromDate, LocalDate toDate) {
        validateHistoryRange(fromDate, toDate);
        Item item = itemRepository.findWithDetailsById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", itemId));
        if (!item.getOwner().getId().equals(actor.getId()) && !isAdmin(actor)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Chỉ chủ món đồ mới được xem lịch mượn chi tiết");
        }
        List<LoanRequest> loans = loanRequestRepository.findApprovedScheduleByItemId(itemId, fromDate, toDate);
        return toResponseList(loans, actor);
    }

    private boolean isPeriodActive(LocalDate borrowFrom, LocalDate dueDate, LocalDate today) {
        return borrowFrom != null && dueDate != null
                && !borrowFrom.isAfter(today) && !dueDate.isBefore(today);
    }

    private void validateLoanDates(LocalDate borrowFrom, LocalDate dueDate) {
        if (borrowFrom == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Ngày bắt đầu mượn không được để trống");
        }
        if (dueDate == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Hạn trả không được để trống");
        }
        LocalDate today = LocalDate.now(LOAN_ZONE);
        if (borrowFrom.isBefore(today)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Ngày bắt đầu mượn không được ở quá khứ");
        }
        if (dueDate.isBefore(borrowFrom)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Hạn trả phải sau hoặc bằng ngày bắt đầu mượn");
        }
    }

    private void validateHistoryRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "fromDate không được sau toDate");
        }
    }

    private Instant historyStart(LocalDate fromDate) {
        return fromDate == null ? null : fromDate.atStartOfDay(LOAN_ZONE).toInstant();
    }

    private Instant historyEndExclusive(LocalDate toDate) {
        return toDate == null ? null : toDate.plusDays(1).atStartOfDay(LOAN_ZONE).toInstant();
    }

    @Transactional(readOnly = true)
    public LoanRequestResponse getById(Long loanId, User actor) {
        LoanRequest loan = findLoan(loanId);
        boolean isBorrower = loan.getBorrower().getId().equals(actor.getId());
        boolean isOwner = loan.getItem().getOwner().getId().equals(actor.getId());
        if (!isBorrower && !isOwner && !isAdmin(actor)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return toResponse(loan, actor);
    }

    @Transactional(readOnly = true)
    public PageResponse<LoanRequestResponse> getOverdue(User actor, Pageable pageable) {
        if (!isAdmin(actor)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return toPageResponse(
                loanRequestRepository.findOverdue(LocalDate.now(LOAN_ZONE), boundedPageable(pageable)),
                actor);
    }

    private LoanRequestResponse toResponse(LoanRequest loan, User actor) {
        boolean isParticipant = actor != null && (
                loan.getBorrower().getId().equals(actor.getId())
                        || loan.getItem().getOwner().getId().equals(actor.getId())
        );
        if (!isParticipant || loan.getStatus() != LoanStatus.RETURNED) {
            return LoanRequestResponse.from(loan, false, false);
        }
        boolean hasReviewed = loan.getId() != null
                && reviewRepository.existsByLoanIdAndReviewerId(loan.getId(), actor.getId());
        return LoanRequestResponse.from(loan, hasReviewed, !hasReviewed);
    }

    private PageResponse<LoanRequestResponse> toPageResponse(Page<LoanRequest> page, User actor) {
        Set<Long> reviewedLoanIds = resolveReviewedLoanIds(page.getContent(), actor);
        return PageResponse.from(page, loan -> mapWithReviewFlags(loan, actor, reviewedLoanIds));
    }

    private List<LoanRequestResponse> toResponseList(List<LoanRequest> loans, User actor) {
        Set<Long> reviewedLoanIds = resolveReviewedLoanIds(loans, actor);
        return loans.stream()
                .map(loan -> mapWithReviewFlags(loan, actor, reviewedLoanIds))
                .toList();
    }

    private Set<Long> resolveReviewedLoanIds(List<LoanRequest> loans, User actor) {
        if (actor == null || loans == null || loans.isEmpty()) {
            return Collections.emptySet();
        }
        List<Long> returnedIds = loans.stream()
                .filter(l -> l.getStatus() == LoanStatus.RETURNED && l.getId() != null)
                .map(LoanRequest::getId)
                .toList();
        if (returnedIds.isEmpty()) {
            return Collections.emptySet();
        }
        Set<Long> reviewed = reviewRepository.findReviewedLoanIdsByReviewerIdAndLoanIds(actor.getId(), returnedIds);
        return reviewed == null ? Collections.emptySet() : reviewed;
    }

    private LoanRequestResponse mapWithReviewFlags(LoanRequest loan, User actor, Set<Long> reviewedLoanIds) {
        boolean isParticipant = actor != null && (
                loan.getBorrower().getId().equals(actor.getId())
                        || loan.getItem().getOwner().getId().equals(actor.getId())
        );
        if (!isParticipant || loan.getStatus() != LoanStatus.RETURNED) {
            return LoanRequestResponse.from(loan, false, false);
        }
        boolean hasReviewed = loan.getId() != null && reviewedLoanIds.contains(loan.getId());
        return LoanRequestResponse.from(loan, hasReviewed, !hasReviewed);
    }

    private Pageable boundedPageable(Pageable pageable) {
        if (!pageable.isPaged()) {
            return PageRequest.of(0, MAX_PAGE_SIZE, pageable.getSort());
        }
        int page = Math.max(pageable.getPageNumber(), 0);
        int size = Math.min(Math.max(pageable.getPageSize(), 1), MAX_PAGE_SIZE);
        return PageRequest.of(page, size, pageable.getSort());
    }

    private LoanRequest findLoan(Long loanId) {
        return loanRequestRepository.findWithDetailsById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanRequest", loanId));
    }

    private LoanRequest findLoanForUpdate(Long loanId) {
        return loanRequestRepository.findWithDetailsByIdForUpdate(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanRequest", loanId));
    }

    private void requireOwner(LoanRequest loan, User actor) {
        if (!loan.getItem().getOwner().getId().equals(actor.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Chỉ chủ món đồ mới được thực hiện thao tác này");
        }
    }

    private void requireBorrower(LoanRequest loan, User actor) {
        if (!loan.getBorrower().getId().equals(actor.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Chỉ người gửi yêu cầu mới được thực hiện thao tác này");
        }
    }

    private void requirePending(LoanRequest loan) {
        if (loan.getStatus() != LoanStatus.PENDING) {
            throw new BusinessException(ErrorCode.CONFLICT, "Chỉ xử lý được yêu cầu đang ở trạng thái chờ duyệt");
        }
    }

    private boolean isAdmin(User user) {
        return user.getRoles() != null && user.getRoles().contains("ADMIN");
    }

    private void lockAndRefresh(Item item) {
        entityManager.lock(item, LockModeType.PESSIMISTIC_WRITE);
        entityManager.refresh(item);
    }
}
