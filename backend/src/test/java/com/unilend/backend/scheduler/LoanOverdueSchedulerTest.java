package com.unilend.backend.scheduler;

import com.unilend.backend.entity.LoanRequest;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.LoanRequestRepository;
import com.unilend.backend.repository.NotificationRepository;
import com.unilend.backend.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class LoanOverdueSchedulerTest {

    private LoanRequestRepository loanRepository;
    private NotificationRepository notificationRepository;
    private NotificationService notificationService;
    private LoanOverdueScheduler scheduler;

    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @BeforeEach
    void setUp() {
        loanRepository = mock(LoanRequestRepository.class);
        notificationRepository = mock(NotificationRepository.class);
        notificationService = mock(NotificationService.class);

        scheduler = new LoanOverdueScheduler(
                loanRepository, notificationRepository, notificationService);
    }

    @Test
    void shouldMarkPastDueLoanAsOverdueAndNotifyBorrower() {
        User borrower = new User();
        borrower.setId(10L);

        LoanRequest loan = new LoanRequest();
        loan.setId(20L);
        loan.setBorrower(borrower);
        loan.setStatus(LoanRequest.LoanStatus.APPROVED);
        loan.setDueDate(LocalDate.now(ZONE).minusDays(1));

        when(loanRepository.findDueOn(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        when(loanRepository.findOverdue(any(), any(Pageable.class)))
                .thenReturn(
                        new PageImpl<>(List.of(loan)),
                        new PageImpl<>(List.of())
                );

        when(notificationRepository
                .existsByUserIdAndTypeAndLinkAndCreatedAtBetween(
                        anyLong(), anyString(), anyString(),
                        any(Instant.class), any(Instant.class)))
                .thenReturn(false);

        scheduler.updateOverdueLoans();

        assertEquals(LoanRequest.LoanStatus.OVERDUE, loan.getStatus());
        verify(loanRepository).saveAllAndFlush(anyList());
        verify(notificationService).notify(
                eq(10L),
                eq(com.unilend.backend.entity.Notification.NotificationType.LOAN_OVERDUE),
                anyString(),
                eq("/loans/20")
        );
    }

    @Test
    void shouldNotSendDuplicateNotification() {
        User borrower = new User();
        borrower.setId(10L);

        LoanRequest loan = new LoanRequest();
        loan.setId(20L);
        loan.setBorrower(borrower);
        loan.setStatus(LoanRequest.LoanStatus.APPROVED);

        when(loanRepository.findDueOn(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(loan)));

        when(loanRepository.findOverdue(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        when(notificationRepository
                .existsByUserIdAndTypeAndLinkAndCreatedAtBetween(
                        anyLong(), anyString(), anyString(),
                        any(Instant.class), any(Instant.class)))
                .thenReturn(true);

        scheduler.updateOverdueLoans();

        verifyNoInteractions(notificationService);
    }

    @Test
    void shouldNotifyBorrowerOneDayBeforeDueDate() {
        User borrower = new User();
        borrower.setId(10L);

        LocalDate tomorrow = LocalDate.now(ZONE).plusDays(1);

        LoanRequest loan = new LoanRequest();
        loan.setId(30L);
        loan.setBorrower(borrower);
        loan.setStatus(LoanRequest.LoanStatus.APPROVED);
        loan.setDueDate(tomorrow);

        when(loanRepository.findDueOn(eq(tomorrow), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(loan)));

        when(loanRepository.findOverdue(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        when(notificationRepository
                .existsByUserIdAndTypeAndLinkAndCreatedAtBetween(
                        anyLong(), anyString(), anyString(),
                        any(Instant.class), any(Instant.class)))
                .thenReturn(false);

        scheduler.updateOverdueLoans();

        verify(notificationService).notify(
                eq(10L),
                eq(com.unilend.backend.entity.Notification.NotificationType.LOAN_DUE_SOON),
                anyString(),
                eq("/loans/30")
        );

        assertEquals(LoanRequest.LoanStatus.APPROVED, loan.getStatus());
        verify(loanRepository, never()).saveAllAndFlush(anyList());
    }
}
