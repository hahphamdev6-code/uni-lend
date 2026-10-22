package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.entity.AccountToken;
import com.unilend.backend.entity.AccountToken.TokenType;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.AccountTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class AccountTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final AccountTokenRepository accountTokenRepository;

    @Value("${app.security.verify-email-ttl-minutes:1440}")
    private long verifyEmailTtlMinutes;

    @Value("${app.security.reset-password-ttl-minutes:15}")
    private long resetPasswordTtlMinutes;

    @Transactional
    public String createEmailVerificationToken(User user) {
        return createToken(user, TokenType.EMAIL_VERIFICATION, Duration.ofMinutes(verifyEmailTtlMinutes));
    }

    @Transactional
    public String createPasswordResetToken(User user) {
        return createToken(user, TokenType.PASSWORD_RESET, Duration.ofMinutes(resetPasswordTtlMinutes));
    }

    @Transactional
    public User consumeToken(String rawToken, TokenType expectedType) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Token không hợp lệ");
        }
        String hash = hashToken(rawToken.trim());
        Instant now = Instant.now();
        if (accountTokenRepository.consumeValidToken(hash, expectedType, now) == 0) {
            AccountToken accountToken = accountTokenRepository.findByTokenHashAndType(hash, expectedType)
                    .orElseThrow(() -> new BusinessException(
                            ErrorCode.BAD_REQUEST, "Token không hợp lệ hoặc không tồn tại"));
            if (accountToken.isUsed()) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Token này đã được sử dụng");
            }
            if (accountToken.isExpired()) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Token đã hết hạn");
            }
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Token không hợp lệ");
        }

        return accountTokenRepository.findByTokenHashAndType(hash, expectedType)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.BAD_REQUEST, "Token không hợp lệ hoặc không tồn tại"))
                .getUser();
    }

    private String createToken(User user, TokenType type, Duration ttl) {
        accountTokenRepository.invalidateUnusedTokens(user.getId(), type, Instant.now());

        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        AccountToken tokenEntity = AccountToken.builder()
                .user(user)
                .type(type)
                .tokenHash(hashToken(rawToken))
                .expiresAt(Instant.now().plus(ttl))
                .build();
        accountTokenRepository.save(tokenEntity);
        return rawToken;
    }

    public String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}