package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.dto.loan.LoanRequestCreateRequest;
import com.unilend.backend.dto.loan.LoanRequestResponse;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.Item.ItemStatus;
import com.unilend.backend.entity.LoanRequest;
import com.unilend.backend.entity.LoanRequest.LoanStatus;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.LoanRequestRepository;
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

@Service
@RequiredArgsConstructor
public class LoanRequestService {

    private static final int MAX_PAGE_SIZE = 50;

    private final LoanRequestRepository loanRequestRepository;
    private final ItemRepository itemRepository;
    private final EntityManager entityManager;

    @Transactional
    public LoanRequestResponse create(User borrower, LoanRequestCreateRequest req) {
        Item lockedItem = entityManager.find(Item.class, req.itemId(), LockModeType.PESSIMISTIC_WRITE);
        if (lockedItem == null) {
            throw new ResourceNotFoundException("Item", req.itemId());
        }

        Item item = itemRepository.findWithDetailsById(req.itemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item", req.itemId()));

        if (item.getOwner().getId().equals(borrower.getId())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Bạn không thể mượn đồ của chính mình");
        }
        if (item.getStatus() != ItemStatus.AVAILABLE) {
            throw new BusinessException(ErrorCode.CONFLICT, "Món đồ hiện không sẵn sàng để mượn");
        }
        if (req.dueDate().isBefore(req.borrowFrom())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Hạn trả phải sau hoặc bằng ngày bắt đầu mượn");
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

        return LoanRequestResponse.from(loanRequestRepository.save(loan));
    }

    @Transactional
    public LoanRequestResponse approve(Long loanId, User actor) {
        LoanRequest loan = findLoanForUpdate(loanId);
        requireOwner(loan, actor);
        requirePending(loan);

        Item item = loan.getItem();
        lockAndRefresh(item);

        if (item.getStatus() != ItemStatus.AVAILABLE) {
            throw new BusinessException(ErrorCode.CONFLICT, "Món đồ hiện không sẵn sàng để cho mượn");
        }
        if (loanRequestRepository.existsOverlappingApproved(item.getId(), loan.getBorrowFrom(), loan.getDueDate())) {
            throw new BusinessException(ErrorCode.CONFLICT, "Món đồ đã có người mượn trong khoảng thời gian này");
        }

        loan.setStatus(LoanStatus.APPROVED);
        loan.setRespondedAt(Instant.now());
        item.setStatus(ItemStatus.LENT_OUT);
        return LoanRequestResponse.from(loan);
    }

    @Transactional
    public LoanRequestResponse reject(Long loanId, User actor) {
        LoanRequest loan = findLoanForUpdate(loanId);
        requireOwner(loan, actor);
        requirePending(loan);

        loan.setStatus(LoanStatus.REJECTED);
        loan.setRespondedAt(Instant.now());
        return LoanRequestResponse.from(loan);
    }

    @Transactional
    public LoanRequestResponse cancel(Long loanId, User actor) {
        LoanRequest loan = findLoanForUpdate(loanId);
        requireBorrower(loan, actor);
        requirePending(loan);

        loan.setStatus(LoanStatus.CANCELLED);
        return LoanRequestResponse.from(loan);
    }

    @Transactional
    public LoanRequestResponse markReturned(Long loanId, User actor) {
        LoanRequest loan = findLoanForUpdate(loanId);
        requireOwner(loan, actor);
        if (loan.getStatus() != LoanStatus.APPROVED) {
            throw new BusinessException(ErrorCode.CONFLICT, "Chỉ xác nhận trả được với khoản mượn đã duyệt");
        }

        Item item = loan.getItem();
        lockAndRefresh(item);

        loan.setStatus(LoanStatus.RETURNED);
        loan.setReturnedAt(Instant.now());
        if (item.getStatus() == ItemStatus.LENT_OUT) {
            item.setStatus(ItemStatus.AVAILABLE);
        }
        return LoanRequestResponse.from(loan);
    }

    @Transactional(readOnly = true)
    public Page<LoanRequestResponse> getMyRequests(User borrower, LoanStatus status, Pageable pageable) {
        Pageable boundedPageable = boundedPageable(pageable);
        Page<LoanRequest> page = (status == null)
                ? loanRequestRepository.findByBorrowerId(borrower.getId(), boundedPageable)
                : loanRequestRepository.findByBorrowerIdAndStatus(borrower.getId(), status, boundedPageable);
        return page.map(LoanRequestResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<LoanRequestResponse> getIncomingRequests(User owner, LoanStatus status, Pageable pageable) {
        Pageable boundedPageable = boundedPageable(pageable);
        Page<LoanRequest> page = (status == null)
                ? loanRequestRepository.findByItemOwnerId(owner.getId(), boundedPageable)
                : loanRequestRepository.findByItemOwnerIdAndStatus(owner.getId(), status, boundedPageable);
        return page.map(LoanRequestResponse::from);
    }

    @Transactional(readOnly = true)
    public LoanRequestResponse getById(Long loanId, User actor) {
        LoanRequest loan = findLoan(loanId);
        boolean isBorrower = loan.getBorrower().getId().equals(actor.getId());
        boolean isOwner = loan.getItem().getOwner().getId().equals(actor.getId());
        if (!isBorrower && !isOwner && !isAdmin(actor)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return LoanRequestResponse.from(loan);
    }

    @Transactional(readOnly = true)
    public Page<LoanRequestResponse> getOverdue(User actor, Pageable pageable) {
        if (!isAdmin(actor)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return loanRequestRepository.findOverdue(LocalDate.now(), boundedPageable(pageable))
                .map(LoanRequestResponse::from);
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
        entityManager.refresh(item, LockModeType.PESSIMISTIC_WRITE);
    }
}
