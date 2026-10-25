package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.user.ConfirmAccountDeletionRequest;
import com.unilend.backend.dto.user.CreateAccountDeletionRequest;
import com.unilend.backend.entity.AccountDeletionRequest;
import com.unilend.backend.entity.AccountDeletionRequest.Status;
import com.unilend.backend.entity.AccountToken.TokenType;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.AccountDeletionRequestRepository;
import com.unilend.backend.repository.AccountTokenRepository;
import com.unilend.backend.repository.LoanRequestRepository;
import com.unilend.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountDeletionRequestServiceTest {

    @Mock private CurrentUserService currentUserService;
    @Mock private UserRepository userRepository;
    @Mock private AccountDeletionRequestRepository requestRepository;
    @Mock private AccountTokenRepository accountTokenRepository;
    @Mock private AccountTokenService accountTokenService;
    @Mock private LoanRequestRepository loanRequestRepository;
    @Mock private IncidentDeletionGuard incidentDeletionGuard;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private RateLimitService rateLimitService;
    @Mock private EmailService emailService;
    @InjectMocks private AccountDeletionRequestService service;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(7L).email("owner@example.test").fullName("Owner")
                .password("encoded-password").enabled(true).tokenVersion(2).build();
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(userRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(user));
    }

    @Test
    void createReauthenticatesAndNeverReturnsTheRawConfirmationCode() {
        when(passwordEncoder.matches("current-password", "encoded-password")).thenReturn(true);
        when(requestRepository.save(any(AccountDeletionRequest.class))).thenAnswer(invocation -> {
            AccountDeletionRequest request = invocation.getArgument(0);
            request.setId(30L);
            return request;
        });
        when(accountTokenService.createAccountDeletionConfirmationToken(user)).thenReturn("raw-secret-code");

        var response = service.create(new CreateAccountDeletionRequest("current-password"));

        assertEquals(Status.AWAITING_CONFIRMATION, response.status());
        assertFalse(response.anonymizationPermitted());
        assertFalse(response.policyApproved());
        assertFalse(response.toString().contains("raw-secret-code"));
        verify(emailService).sendAccountDeletionConfirmationEmail(
                "owner@example.test", "Owner", "raw-secret-code");
        verify(rateLimitService).checkEmailRateLimit("account-deletion-confirmation", "owner@example.test");
        assertTrue(user.isEnabled());
        assertEquals(2, user.getTokenVersion());
    }

    @Test
    void wrongPasswordDoesNotCreateRequestOrSendCode() {
        when(passwordEncoder.matches("wrong", "encoded-password")).thenReturn(false);

        BusinessException error = assertThrows(BusinessException.class,
                () -> service.create(new CreateAccountDeletionRequest("wrong")));

        assertEquals(ErrorCode.UNAUTHORIZED, error.getErrorCode());
        verify(requestRepository, never()).save(any());
        verify(emailService, never()).sendAccountDeletionConfirmationEmail(any(), any(), any());
    }

    @Test
    void confirmConsumesCodeForOwnAccountAndUnknownIncidentBlocksReadiness() {
        AccountDeletionRequest request = request(Status.AWAITING_CONFIRMATION, 0,
                Instant.now().plusSeconds(300));
        when(requestRepository.findByIdAndUserIdForUpdate(30L, 7L)).thenReturn(Optional.of(request));
        when(accountTokenService.tryConsumeTokenForUser(
                "valid-code", TokenType.ACCOUNT_DELETION_CONFIRMATION, 7L)).thenReturn(true);
        when(requestRepository.save(request)).thenReturn(request);
        when(loanRequestRepository.hasDeletionBlockingLoan(7L)).thenReturn(false);
        when(incidentDeletionGuard.checkForOpenIncidents(7L)).thenReturn(IncidentDeletionGuard.CheckResult.UNKNOWN);

        var response = service.confirm(30L, new ConfirmAccountDeletionRequest("valid-code"));

        assertEquals(Status.CONFIRMED_WAITING_CLEARANCE, response.status());
        assertTrue(response.blockers().contains("INCIDENT_CHECK_UNAVAILABLE"));
        assertFalse(response.operationalChecksClear());
        assertFalse(response.anonymizationPermitted());
        verify(accountTokenService).tryConsumeTokenForUser(
                "valid-code", TokenType.ACCOUNT_DELETION_CONFIRMATION, 7L);
        verify(userRepository).findByIdForUpdate(7L);
        assertTrue(user.isEnabled());
        assertEquals(2, user.getTokenVersion());
    }

    @Test
    void expiredConfirmationExpiresRequestWithoutConsumingCode() {
        AccountDeletionRequest request = request(Status.AWAITING_CONFIRMATION, 0,
                Instant.now().minusSeconds(1));
        when(requestRepository.findByIdAndUserIdForUpdate(30L, 7L)).thenReturn(Optional.of(request));
        when(requestRepository.save(request)).thenReturn(request);

        var response = service.confirm(30L, new ConfirmAccountDeletionRequest("expired-code"));

        assertEquals(Status.EXPIRED, response.status());
        assertNull(request.getActiveUserId());
        verify(accountTokenService, never()).tryConsumeTokenForUser(anyString(), any(), anyLong());
        verify(accountTokenRepository).invalidateUnusedTokens(
                eq(7L), eq(TokenType.ACCOUNT_DELETION_CONFIRMATION), any(Instant.class));
    }

    @Test
    void failedCodesArePersistedAndFurtherAttemptsAreRejected() {
        AccountDeletionRequest request = request(Status.AWAITING_CONFIRMATION, 4,
                Instant.now().plusSeconds(300));
        when(requestRepository.findByIdAndUserIdForUpdate(30L, 7L)).thenReturn(Optional.of(request));
        when(accountTokenService.tryConsumeTokenForUser(
                "wrong", TokenType.ACCOUNT_DELETION_CONFIRMATION, 7L)).thenReturn(false);
        when(requestRepository.save(request)).thenReturn(request);

        BusinessException fifth = assertThrows(BusinessException.class,
                () -> service.confirm(30L, new ConfirmAccountDeletionRequest("wrong")));
        assertEquals(ErrorCode.BAD_REQUEST, fifth.getErrorCode());
        assertEquals(5, request.getFailedConfirmationAttempts());

        BusinessException sixth = assertThrows(BusinessException.class,
                () -> service.confirm(30L, new ConfirmAccountDeletionRequest("wrong")));
        assertEquals(ErrorCode.TOO_MANY_REQUESTS, sixth.getErrorCode());
        verify(accountTokenService, times(1)).tryConsumeTokenForUser(
                "wrong", TokenType.ACCOUNT_DELETION_CONFIRMATION, 7L);
    }

    @Test
    void otherUsersCannotConfirmOrCancelRequest() {
        when(requestRepository.findByIdAndUserIdForUpdate(30L, 7L)).thenReturn(Optional.empty());

        assertThrows(com.unilend.backend.common.exception.ResourceNotFoundException.class,
                () -> service.confirm(30L, new ConfirmAccountDeletionRequest("code")));
        assertThrows(com.unilend.backend.common.exception.ResourceNotFoundException.class,
                () -> service.cancel(30L));
        verify(accountTokenService, never()).tryConsumeTokenForUser(anyString(), any(), anyLong());
        verify(accountTokenRepository, never()).invalidateUnusedTokens(anyLong(), any(), any());
    }

    @Test
    void readinessUsesCurrentLoanDataAndIncidentFailureIsUnknown() {
        AccountDeletionRequest request = request(Status.CONFIRMED_WAITING_CLEARANCE, 0,
                Instant.now().plusSeconds(300));
        when(requestRepository.findByActiveUserId(7L)).thenReturn(Optional.of(request));
        when(loanRequestRepository.hasDeletionBlockingLoan(7L)).thenReturn(false, true);
        when(incidentDeletionGuard.checkForOpenIncidents(7L)).thenThrow(new IllegalStateException("unavailable"));

        var clearLoans = service.current();
        var activeLoan = service.current();

        assertTrue(clearLoans.blockers().contains("INCIDENT_CHECK_UNAVAILABLE"));
        assertTrue(activeLoan.blockers().contains("OPEN_LOAN"));
        assertTrue(activeLoan.blockers().contains("INCIDENT_CHECK_UNAVAILABLE"));
        assertFalse(activeLoan.anonymizationPermitted());
        verify(loanRequestRepository, times(2)).hasDeletionBlockingLoan(7L);
    }

    @Test
    void loanCheckFailureBlocksReadiness() {
        AccountDeletionRequest request = request(Status.CONFIRMED_WAITING_CLEARANCE, 0,
                Instant.now().plusSeconds(300));
        when(requestRepository.findByActiveUserId(7L)).thenReturn(Optional.of(request));
        when(loanRequestRepository.hasDeletionBlockingLoan(7L))
                .thenThrow(new IllegalStateException("unavailable"));
        when(incidentDeletionGuard.checkForOpenIncidents(7L))
                .thenReturn(IncidentDeletionGuard.CheckResult.CLEAR);

        var response = service.current();

        assertTrue(response.blockers().contains("LOAN_CHECK_UNAVAILABLE"));
        assertFalse(response.operationalChecksClear());
        assertFalse(response.anonymizationPermitted());
    }

    @Test
    void cancellingOwnRequestInvalidatesUnusedCodeAndDoesNotChangeAccountOrLoans() {
        AccountDeletionRequest request = request(Status.AWAITING_CONFIRMATION, 0,
                Instant.now().plusSeconds(300));
        when(requestRepository.findByIdAndUserIdForUpdate(30L, 7L)).thenReturn(Optional.of(request));
        when(requestRepository.save(request)).thenReturn(request);

        var response = service.cancel(30L);

        assertEquals(Status.CANCELLED, response.status());
        assertNull(request.getActiveUserId());
        verify(accountTokenRepository).invalidateUnusedTokens(
                eq(7L), eq(TokenType.ACCOUNT_DELETION_CONFIRMATION), any(Instant.class));
        verifyNoInteractions(loanRequestRepository);
        assertTrue(user.isEnabled());
        assertEquals(2, user.getTokenVersion());
    }

    private AccountDeletionRequest request(Status status, int attempts, Instant expiresAt) {
        return AccountDeletionRequest.builder().id(30L).user(user).activeUserId(7L).status(status)
                .requestedAt(Instant.now().minusSeconds(60)).confirmationExpiresAt(expiresAt)
                .failedConfirmationAttempts(attempts).build();
    }
}
