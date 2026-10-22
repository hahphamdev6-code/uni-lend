package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RateLimitServiceTest {

    @Test
    void limitsLoginAttemptsByNormalizedEmail() {
        RateLimitService rateLimitService = new RateLimitService();
        ReflectionTestUtils.setField(rateLimitService, "loginMaxAttempts", 2);
        ReflectionTestUtils.setField(rateLimitService, "loginWindowSeconds", 60L);

        rateLimitService.checkLoginRateLimit(" USER@example.test ");
        rateLimitService.checkLoginRateLimit("user@example.test");

        BusinessException exception = assertThrows(BusinessException.class,
                () -> rateLimitService.checkLoginRateLimit("user@example.test"));
        assertEquals(ErrorCode.TOO_MANY_REQUESTS, exception.getErrorCode());
    }

    @Test
    void limitsEmailRequestsSeparatelyByActionAndAddress() {
        RateLimitService rateLimitService = new RateLimitService();
        ReflectionTestUtils.setField(rateLimitService, "emailMaxAttempts", 1);
        ReflectionTestUtils.setField(rateLimitService, "emailWindowSeconds", 900L);

        rateLimitService.checkEmailRateLimit("forgot-password", "user@example.test");
        rateLimitService.checkEmailRateLimit("resend-verify", "user@example.test");

        BusinessException exception = assertThrows(BusinessException.class,
                () -> rateLimitService.checkEmailRateLimit("forgot-password", "USER@example.test"));
        assertEquals(ErrorCode.TOO_MANY_REQUESTS, exception.getErrorCode());
    }

    @Test
    void checkAllowsNewAttemptAfterWindowExpires() {
        RateLimitService rateLimitService = new RateLimitService();

        rateLimitService.check("bucket", 1, Duration.ofMillis(-1), "rate limited");
        rateLimitService.check("bucket", 1, Duration.ofMillis(-1), "rate limited");
    }

    @Test
    void periodicallyRemovesExpiredBuckets() {
        RateLimitService rateLimitService = new RateLimitService();

        for (int i = 0; i < 256; i++) {
            rateLimitService.check("expired-" + i, 1, Duration.ofMillis(-1), "rate limited");
        }

        var buckets = (java.util.Map<?, ?>) ReflectionTestUtils.getField(rateLimitService, "buckets");
        assertTrue(buckets.isEmpty());
    }
}
