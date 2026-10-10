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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.function.Executable;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LoanRequestServiceTest {

    @Mock
    private LoanRequestRepository loanRequestRepository;
    @Mock
    private ItemRepository itemRepository;
    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private LoanRequestService service;

    private final LocalDate today = LocalDate.now();

    private User owner;
    private User borrower;
    private Item item;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(1L).email("owner@unilend.test").password("x").fullName("Chủ đồ").build();
        borrower = User.builder().id(2L).email("borrower@unilend.test").password("x").fullName("Người mượn").build();
        item = Item.builder().id(10L).title("Máy tính Casio").owner(owner).build();

        when(entityManager.find(Item.class, 10L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(item);
        when(itemRepository.findWithDetailsById(10L)).thenReturn(Optional.of(item));
        when(loanRequestRepository.save(any(LoanRequest.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void create_success_locksItemBeforeCheckingRequests() {
        LoanRequestResponse response = service.create(borrower, createReq(10L, today, today.plusDays(3)));

        assertEquals(LoanStatus.PENDING, response.status());
        assertEquals(10L, response.item().id());
        assertEquals(2L, response.borrower().id());
        assertEquals(1L, response.owner().id());
        verify(entityManager).find(Item.class, 10L, LockModeType.PESSIMISTIC_WRITE);
        verify(loanRequestRepository).save(any(LoanRequest.class));
    }

    @Test
    void create_itemNotFound_throwsResourceNotFound() {
        when(entityManager.find(Item.class, 99L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(null);

        assertThrows(ResourceNotFoundException.class,
                () -> service.create(borrower, createReq(99L, today, today.plusDays(1))));
    }

    @Test
    void create_ownItem_badRequest() {
        assertCode(ErrorCode.BAD_REQUEST, () -> service.create(owner, createReq(10L, today, today.plusDays(1))));
    }

    @Test
    void create_itemNotAvailable_conflict() {
        item.setStatus(ItemStatus.LENT_OUT);

        assertCode(ErrorCode.CONFLICT, () -> service.create(borrower, createReq(10L, today, today.plusDays(1))));
        verify(loanRequestRepository, never()).save(any());
    }

    @Test
    void create_dueDateBeforeBorrowFrom_badRequest() {
        assertCode(ErrorCode.BAD_REQUEST,
                () -> service.create(borrower, createReq(10L, today.plusDays(2), today)));
    }

    @Test
    void create_duplicatePending_conflict() {
        when(loanRequestRepository.existsByItemIdAndBorrowerIdAndStatus(10L, 2L, LoanStatus.PENDING))
                .thenReturn(true);

        assertCode(ErrorCode.CONFLICT, () -> service.create(borrower, createReq(10L, today, today.plusDays(1))));
    }

    @Test
    void create_overlapWithApproved_conflict() {
        when(loanRequestRepository.existsOverlappingApproved(eq(10L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(true);

        assertCode(ErrorCode.CONFLICT, () -> service.create(borrower, createReq(10L, today, today.plusDays(1))));
    }

    @Test
    void approve_success_setsLentOut() {
        LoanRequest loan = givenLoan(LoanStatus.PENDING);

        LoanRequestResponse response = service.approve(100L, owner);

        assertEquals(LoanStatus.APPROVED, response.status());
        assertNotNull(loan.getRespondedAt());
        assertEquals(ItemStatus.LENT_OUT, item.getStatus());
        verify(loanRequestRepository).findWithDetailsByIdForUpdate(100L);
        verify(entityManager).refresh(item, LockModeType.PESSIMISTIC_WRITE);
    }

    @Test
    void approve_byNonOwner_forbidden() {
        givenLoan(LoanStatus.PENDING);

        assertCode(ErrorCode.FORBIDDEN, () -> service.approve(100L, borrower));
        assertEquals(ItemStatus.AVAILABLE, item.getStatus());
    }

    @Test
    void approve_notPending_conflict() {
        givenLoan(LoanStatus.APPROVED);

        assertCode(ErrorCode.CONFLICT, () -> service.approve(100L, owner));
    }

    @Test
    void approve_itemAlreadyLentOut_conflict() {
        givenLoan(LoanStatus.PENDING);
        item.setStatus(ItemStatus.LENT_OUT);

        assertCode(ErrorCode.CONFLICT, () -> service.approve(100L, owner));
    }

    @Test
    void approve_loanNotFound_throwsResourceNotFound() {
        when(loanRequestRepository.findWithDetailsById(404L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.approve(404L, owner));
    }

    @Test
    void reject_success() {
        LoanRequest loan = givenLoan(LoanStatus.PENDING);

        LoanRequestResponse response = service.reject(100L, owner);

        assertEquals(LoanStatus.REJECTED, response.status());
        assertNotNull(loan.getRespondedAt());
        assertEquals(ItemStatus.AVAILABLE, item.getStatus());
        verify(loanRequestRepository).findWithDetailsByIdForUpdate(100L);
    }

    @Test
    void reject_byNonOwner_forbidden() {
        givenLoan(LoanStatus.PENDING);

        assertCode(ErrorCode.FORBIDDEN, () -> service.reject(100L, borrower));
    }

    @Test
    void cancel_byBorrower_success() {
        givenLoan(LoanStatus.PENDING);

        LoanRequestResponse response = service.cancel(100L, borrower);

        assertEquals(LoanStatus.CANCELLED, response.status());
        verify(loanRequestRepository).findWithDetailsByIdForUpdate(100L);
    }

    @Test
    void cancel_byOwner_forbidden() {
        givenLoan(LoanStatus.PENDING);

        assertCode(ErrorCode.FORBIDDEN, () -> service.cancel(100L, owner));
    }

    @Test
    void cancel_alreadyApproved_conflict() {
        givenLoan(LoanStatus.APPROVED);

        assertCode(ErrorCode.CONFLICT, () -> service.cancel(100L, borrower));
    }

    @Test
    void markReturned_success_setsAvailableAgain() {
        LoanRequest loan = givenLoan(LoanStatus.APPROVED);
        item.setStatus(ItemStatus.LENT_OUT);

        LoanRequestResponse response = service.markReturned(100L, owner);

        assertEquals(LoanStatus.RETURNED, response.status());
        assertNotNull(loan.getReturnedAt());
        assertEquals(ItemStatus.AVAILABLE, item.getStatus());
        verify(loanRequestRepository).findWithDetailsByIdForUpdate(100L);
    }

    @Test
    void markReturned_notApproved_conflict() {
        givenLoan(LoanStatus.PENDING);

        assertCode(ErrorCode.CONFLICT, () -> service.markReturned(100L, owner));
    }

    @Test
    void markReturned_byNonOwner_forbidden() {
        givenLoan(LoanStatus.APPROVED);

        assertCode(ErrorCode.FORBIDDEN, () -> service.markReturned(100L, borrower));
    }

    @Test
    void getById_byStranger_forbidden() {
        givenLoan(LoanStatus.PENDING);
        User stranger = User.builder().id(3L).email("stranger@unilend.test").fullName("Người lạ").build();

        assertCode(ErrorCode.FORBIDDEN, () -> service.getById(100L, stranger));
    }

    @Test
    void getById_byBorrower_allowed() {
        givenLoan(LoanStatus.PENDING);

        assertEquals(100L, service.getById(100L, borrower).id());
    }

    @Test
    void getMyRequests_capsPageSize() {
        when(loanRequestRepository.findByBorrowerId(eq(2L), any(Pageable.class))).thenReturn(Page.empty());

        service.getMyRequests(borrower, null, PageRequest.of(0, 1000));

        verify(loanRequestRepository).findByBorrowerId(eq(2L),
                org.mockito.ArgumentMatchers.argThat(pageable -> pageable.getPageSize() == 50));
    }

    private LoanRequestCreateRequest createReq(Long itemId, LocalDate from, LocalDate to) {
        return new LoanRequestCreateRequest(itemId, from, to, "Mượn để học nhóm");
    }

    private LoanRequest givenLoan(LoanStatus status) {
        LoanRequest loan = LoanRequest.builder()
                .id(100L)
                .item(item)
                .borrower(borrower)
                .status(status)
                .borrowFrom(today)
                .dueDate(today.plusDays(3))
                .build();
        when(loanRequestRepository.findWithDetailsById(100L)).thenReturn(Optional.of(loan));
        when(loanRequestRepository.findWithDetailsByIdForUpdate(100L)).thenReturn(Optional.of(loan));
        return loan;
    }

    private void assertCode(ErrorCode expected, Executable action) {
        BusinessException exception = assertThrows(BusinessException.class, action);
        assertEquals(expected, exception.getErrorCode());
    }
}
