package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class RateLimitService {

    private static final long CLEANUP_INTERVAL = 256;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final AtomicLong checks = new AtomicLong();

    @Value("${app.rate-limit.login-max-attempts:5}")
    private int loginMaxAttempts;

    @Value("${app.rate-limit.login-window-seconds:60}")
    private long loginWindowSeconds;

    @Value("${app.rate-limit.email-max-attempts:3}")
    private int emailMaxAttempts;

    @Value("${app.rate-limit.email-window-seconds:900}")
    private long emailWindowSeconds;

    public void checkLoginRateLimit(String key) {
        check("login:" + normalizeKey(key), loginMaxAttempts, Duration.ofSeconds(loginWindowSeconds),
                "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau ít phút");
    }

    public void checkEmailRateLimit(String action, String key) {
        check("email:" + action + ":" + normalizeKey(key), emailMaxAttempts, Duration.ofSeconds(emailWindowSeconds),
                "Bạn đã yêu cầu gửi email quá nhiều lần. Vui lòng thử lại sau");
    }

    public void check(String bucketKey, int maxAttempts, Duration window, String errorMessage) {
        Instant now = Instant.now();
        Instant cutoff = now.minus(window);

        buckets.compute(bucketKey, (key, bucket) -> {
            Bucket currentBucket = bucket == null ? new Bucket(window) : bucket;
            currentBucket.expireBefore(cutoff);
            if (currentBucket.timestamps.size() >= maxAttempts) {
                throw new BusinessException(ErrorCode.TOO_MANY_REQUESTS, errorMessage);
            }
            currentBucket.timestamps.addLast(now);
            return currentBucket;
        });

        if (checks.incrementAndGet() % CLEANUP_INTERVAL == 0) {
            removeExpiredBuckets(now);
        }
    }

    public void reset(String prefixAndKey) {
        buckets.remove(prefixAndKey);
    }

    private void removeExpiredBuckets(Instant now) {
        buckets.forEach((key, bucket) -> buckets.computeIfPresent(key, (ignored, current) -> {
            current.expireBefore(now.minus(current.window));
            return current.timestamps.isEmpty() ? null : current;
        }));
    }

    private String normalizeKey(String key) {
        return key == null ? "anonymous" : key.trim().toLowerCase();
    }

    private static final class Bucket {
        private final Duration window;
        private final Deque<Instant> timestamps = new ArrayDeque<>();

        private Bucket(Duration window) {
            this.window = window;
        }

        private void expireBefore(Instant cutoff) {
            while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(cutoff)) {
                timestamps.removeFirst();
            }
        }
    }
}