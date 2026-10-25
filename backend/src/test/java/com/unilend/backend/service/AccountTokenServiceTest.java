package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.entity.AccountToken;
import com.unilend.backend.entity.AccountToken.TokenType;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.AccountTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class AccountTokenServiceTest {

    @Mock
    private AccountTokenRepository accountTokenRepository;

    @InjectMocks
    private AccountTokenService accountTokenService;

    @Test
    void consumeTokenClaimsValidTokenAtomicallyBeforeReturningUser() {
        String rawToken = "one-time-token";
        User user = User.builder().id(1L).email("person@example.test").build();
        AccountToken token = AccountToken.builder().user(user).type(TokenType.PASSWORD_RESET).build();
        when(accountTokenRepository.consumeValidToken(
                eq(accountTokenService.hashToken(rawToken)), eq(TokenType.PASSWORD_RESET), any(Instant.class)))
                .thenReturn(1);
        when(accountTokenRepository.findByTokenHashAndType(
                accountTokenService.hashToken(rawToken), TokenType.PASSWORD_RESET))
                .thenReturn(Optional.of(token));

        User consumedUser = accountTokenService.consumeToken(rawToken, TokenType.PASSWORD_RESET);

        assertEquals(user, consumedUser);
        verify(accountTokenRepository).consumeValidToken(
                eq(accountTokenService.hashToken(rawToken)), eq(TokenType.PASSWORD_RESET), any(Instant.class));
    }

    @Test
    void consumeTokenRejectsTokenAlreadyClaimed() {
        String rawToken = "already-used-token";
        AccountToken token = AccountToken.builder()
                .type(TokenType.EMAIL_VERIFICATION)
                .usedAt(Instant.now())
                .build();
        when(accountTokenRepository.consumeValidToken(
                eq(accountTokenService.hashToken(rawToken)), eq(TokenType.EMAIL_VERIFICATION), any(Instant.class)))
                .thenReturn(0);
        when(accountTokenRepository.findByTokenHashAndType(
                accountTokenService.hashToken(rawToken), TokenType.EMAIL_VERIFICATION))
                .thenReturn(Optional.of(token));

        assertThrows(BusinessException.class,
                () -> accountTokenService.consumeToken(rawToken, TokenType.EMAIL_VERIFICATION));
    }

    @Test
    void consumeTokenRejectsExpiredToken() {
        String rawToken = "expired-token";
        AccountToken token = AccountToken.builder()
                .type(TokenType.PASSWORD_RESET)
                .expiresAt(Instant.now().minusSeconds(1))
                .build();
        when(accountTokenRepository.consumeValidToken(
                eq(accountTokenService.hashToken(rawToken)), eq(TokenType.PASSWORD_RESET), any(Instant.class)))
                .thenReturn(0);
        when(accountTokenRepository.findByTokenHashAndType(
                accountTokenService.hashToken(rawToken), TokenType.PASSWORD_RESET))
                .thenReturn(Optional.of(token));

        assertThrows(BusinessException.class,
                () -> accountTokenService.consumeToken(rawToken, TokenType.PASSWORD_RESET));
    }

    @Test
    void deletionCodeConsumptionIsAtomicAndBoundToExpectedUser() {
        String rawCode = "deletion-confirmation-code";
        String hash = accountTokenService.hashToken(rawCode);
        when(accountTokenRepository.consumeValidTokenForUser(
                eq(hash), eq(TokenType.ACCOUNT_DELETION_CONFIRMATION), eq(9L), any(Instant.class)))
                .thenReturn(1);

        assertEquals(true, accountTokenService.tryConsumeTokenForUser(
                rawCode, TokenType.ACCOUNT_DELETION_CONFIRMATION, 9L));
        verify(accountTokenRepository).consumeValidTokenForUser(
                eq(hash), eq(TokenType.ACCOUNT_DELETION_CONFIRMATION), eq(9L), any(Instant.class));
    }

    @Test
    void failedDeletionCodeConsumptionReturnsFalseWithoutThrowingOrReadingOtherAccounts() {
        String rawCode = "wrong-deletion-code";
        when(accountTokenRepository.consumeValidTokenForUser(
                any(), eq(TokenType.ACCOUNT_DELETION_CONFIRMATION), eq(9L), any(Instant.class)))
                .thenReturn(0);

        assertEquals(false, accountTokenService.tryConsumeTokenForUser(
                rawCode, TokenType.ACCOUNT_DELETION_CONFIRMATION, 9L));
        verify(accountTokenRepository, never()).findByTokenHashAndType(any(), any());
    }
}
