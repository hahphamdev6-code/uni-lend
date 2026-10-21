package com.unilend.backend.service;

import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.controller.AdminStatsController;
import com.unilend.backend.entity.LoanRequest.LoanStatus;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.LoanRequestRepository;
import com.unilend.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminStatsServiceTest {

    @Test
    void returnsTotalsStatusCountsAndMostBorrowedCategories() {
        UserRepository users = mock(UserRepository.class);
        ItemRepository items = mock(ItemRepository.class);
        LoanRequestRepository loans = mock(LoanRequestRepository.class);
        when(users.count()).thenReturn(12L);
        when(items.count()).thenReturn(8L);
        when(loans.countLoansByStatus()).thenReturn(List.<Object[]>of(
                new Object[]{LoanStatus.APPROVED, 4L},
                new Object[]{LoanStatus.RETURNED, 3L}));
        when(loans.findMostBorrowedCategories(any(Pageable.class)))
                .thenReturn(List.<Object[]>of(new Object[]{5L, "Electronics", 6L}));

        var result = new AdminStatsService(users, items, loans).getStats();

        assertEquals(12L, result.totalUsers());
        assertEquals(8L, result.totalItems());
        assertEquals(4L, result.loansByStatus().get("APPROVED"));
        assertEquals(3L, result.loansByStatus().get("RETURNED"));
        assertEquals(0L, result.loansByStatus().get("PENDING"));
        assertEquals(5L, result.mostBorrowedCategories().get(0).categoryId());
        assertEquals("Electronics", result.mostBorrowedCategories().get(0).categoryName());
        assertEquals(6L, result.mostBorrowedCategories().get(0).loanCount());
        verify(loans).findMostBorrowedCategories(any(Pageable.class));
    }

    @Test
    void emptyDatabaseReturnsZeroTotalsAndEmptyCategories() {
        UserRepository users = mock(UserRepository.class);
        ItemRepository items = mock(ItemRepository.class);
        LoanRequestRepository loans = mock(LoanRequestRepository.class);
        when(loans.countLoansByStatus()).thenReturn(List.of());
        when(loans.findMostBorrowedCategories(any(Pageable.class))).thenReturn(List.of());

        var result = new AdminStatsService(users, items, loans).getStats();
        assertEquals(0L, result.totalUsers());
        assertEquals(0L, result.totalItems());
        assertTrue(result.mostBorrowedCategories().isEmpty());
        assertTrue(result.loansByStatus().values().stream().allMatch(count -> count == 0L));
    }

    @Test
    void controllerChecksAdminRoleBeforeReturningStats() {
        CurrentUserService currentUser = mock(CurrentUserService.class);
        AdminStatsService stats = mock(AdminStatsService.class);
        doThrow(new SecurityException("Forbidden")).when(currentUser).requireAdmin();

        var controller = new AdminStatsController(currentUser, stats);
        assertThrows(SecurityException.class, controller::getStats);
        verifyNoInteractions(stats);
    }
}
