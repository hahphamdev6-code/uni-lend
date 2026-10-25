package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.user.AccountDeletionRequestResponse;
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
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountDeletionRequestService {

    private static final int MAX_FAILED_CONFIRMATION_ATTEMPTS = 5;
    private static final String ACTIVE_LOAN_BLOCKER = "OPEN_LOAN";
    private static final String OPEN_INCIDENT_BLOCKER = "OPEN_INCIDENT";
    private static final String INCIDENT_UNAVAILABLE_BLOCKER = "INCIDENT_CHECK_UNAVAILABLE";
    private static final String LOAN_CHECK_UNAVAILABLE_BLOCKER = "LOAN_CHECK_UNAVAILABLE";

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final AccountDeletionRequestRepository requestRepository;
    private final AccountTokenRepository accountTokenRepository;
    private final AccountTokenService accountTokenService;
    private final LoanRequestRepository loanRequestRepository;
    private final IncidentDeletionGuard incidentDeletionGuard;
    private final PasswordEncoder passwordEncoder;
    private final RateLimitService rateLimitService;
    private final EmailService emailService;

    @Value("${app.security.account-deletion-confirmation-ttl-minutes:15}")
    private long confirmationTtlMinutes;

    @Transactional
    public AccountDeletionRequestResponse create(CreateAccountDeletionRequest input) {
        User actor = lockCurrentUser();
        if (!passwordEncoder.matches(input.currentPassword(), actor.getPassword())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Mật khẩu xác nhận không đúng");
        }
        rateLimitService.checkEmailRateLimit("account-deletion-confirmation", actor.getEmail());

        Instant now = Instant.now();
        requestRepository.findByActiveUserId(actor.getId()).ifPresent(existing -> {
            expireIfNecessary(existing, now);
            if (existing.getActiveUserId() != null) {
                throw new BusinessException(ErrorCode.CONFLICT,
                        "Tài khoản đã có yêu cầu đóng đang hoạt động");
            }
        });

        AccountDeletionRequest request = requestRepository.save(AccountDeletionRequest.builder()
                .user(actor)
                .activeUserId(actor.getId())
                .status(Status.AWAITING_CONFIRMATION)
                .requestedAt(now)
                .confirmationExpiresAt(now.plus(confirmationTtlMinutes, ChronoUnit.MINUTES))
                .failedConfirmationAttempts(0)
                .build());

        String rawCode = accountTokenService.createAccountDeletionConfirmationToken(actor);
        emailService.sendAccountDeletionConfirmationEmail(actor.getEmail(), actor.getFullName(), rawCode);
        return toResponse(request);
    }

    @Transactional(noRollbackFor = InvalidConfirmationAttemptException.class)
    public AccountDeletionRequestResponse confirm(Long requestId, ConfirmAccountDeletionRequest input) {
        User actor = lockCurrentUser();
        AccountDeletionRequest request = getOwnedRequestForUpdate(requestId, actor.getId());
        if (request.getStatus() != Status.AWAITING_CONFIRMATION) {
            throw new BusinessException(ErrorCode.CONFLICT, "Yêu cầu không còn chờ xác nhận");
        }

        Instant now = Instant.now();
        if (!request.getConfirmationExpiresAt().isAfter(now)) {
            expireIfNecessary(request, now);
            return toResponse(request);
        }
        if (request.getFailedConfirmationAttempts() >= MAX_FAILED_CONFIRMATION_ATTEMPTS) {
            throw new BusinessException(ErrorCode.TOO_MANY_REQUESTS,
                    "Đã vượt số lần nhập mã cho phép; hãy tạo yêu cầu mới sau khi yêu cầu này hết hạn");
        }

        if (!accountTokenService.tryConsumeTokenForUser(
                input.code(), TokenType.ACCOUNT_DELETION_CONFIRMATION, actor.getId())) {
            request.setFailedConfirmationAttempts(request.getFailedConfirmationAttempts() + 1);
            requestRepository.save(request);
            throw new InvalidConfirmationAttemptException();
        }

        request.setStatus(Status.CONFIRMED_WAITING_CLEARANCE);
        request.setConfirmedAt(now);
        return toResponse(requestRepository.save(request));
    }

    @Transactional
    public AccountDeletionRequestResponse current() {
        User actor = lockCurrentUser();
        AccountDeletionRequest request = requestRepository.findByActiveUserId(actor.getId())
                .or(() -> requestRepository.findFirstByUser_IdOrderByRequestedAtDesc(actor.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("yêu cầu đóng tài khoản", actor.getId()));
        expireIfNecessary(request, Instant.now());
        return toResponse(request);
    }

    @Transactional
    public AccountDeletionRequestResponse cancel(Long requestId) {
        User actor = lockCurrentUser();
        AccountDeletionRequest request = getOwnedRequestForUpdate(requestId, actor.getId());
        if (request.getStatus() == Status.CANCELLED || request.getStatus() == Status.EXPIRED) {
            return toResponse(request);
        }
        request.setStatus(Status.CANCELLED);
        request.setActiveUserId(null);
        request.setCancelledAt(Instant.now());
        accountTokenRepository.invalidateUnusedTokens(
                actor.getId(), TokenType.ACCOUNT_DELETION_CONFIRMATION, Instant.now());
        return toResponse(requestRepository.save(request));
    }

    private User lockCurrentUser() {
        User authenticated = currentUserService.getCurrentUser();
        return userRepository.findByIdForUpdate(authenticated.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
    }

    private AccountDeletionRequest getOwnedRequestForUpdate(Long requestId, Long ownerId) {
        return requestRepository.findByIdAndUserIdForUpdate(requestId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("yêu cầu đóng tài khoản", requestId));
    }

    private void expireIfNecessary(AccountDeletionRequest request, Instant now) {
        if (request.getStatus() == Status.AWAITING_CONFIRMATION
                && !request.getConfirmationExpiresAt().isAfter(now)) {
            request.setStatus(Status.EXPIRED);
            request.setActiveUserId(null);
            accountTokenRepository.invalidateUnusedTokens(
                    request.getUser().getId(), TokenType.ACCOUNT_DELETION_CONFIRMATION, now);
            requestRepository.save(request);
        }
    }

    private AccountDeletionRequestResponse toResponse(AccountDeletionRequest request) {
        List<String> blockers = new ArrayList<>();
        if (request.getStatus() == Status.CONFIRMED_WAITING_CLEARANCE) {
            try {
                if (loanRequestRepository.hasDeletionBlockingLoan(request.getUser().getId())) {
                    blockers.add(ACTIVE_LOAN_BLOCKER);
                }
            } catch (RuntimeException unavailable) {
                blockers.add(LOAN_CHECK_UNAVAILABLE_BLOCKER);
            }
            IncidentDeletionGuard.CheckResult incidentResult;
            try {
                incidentResult = incidentDeletionGuard.checkForOpenIncidents(request.getUser().getId());
            } catch (RuntimeException unavailable) {
                incidentResult = IncidentDeletionGuard.CheckResult.UNKNOWN;
            }
            if (incidentResult == IncidentDeletionGuard.CheckResult.OPEN) {
                blockers.add(OPEN_INCIDENT_BLOCKER);
            } else if (incidentResult != IncidentDeletionGuard.CheckResult.CLEAR) {
                blockers.add(INCIDENT_UNAVAILABLE_BLOCKER);
            }
        }

        boolean operationalChecksClear = request.getStatus() == Status.CONFIRMED_WAITING_CLEARANCE
                && blockers.isEmpty();
        return new AccountDeletionRequestResponse(
                request.getId(), request.getStatus(), request.getRequestedAt(),
                request.getConfirmationExpiresAt(), request.getConfirmedAt(),
                operationalChecksClear, List.copyOf(blockers), false, false);
    }

    private static final class InvalidConfirmationAttemptException extends BusinessException {
        private InvalidConfirmationAttemptException() {
            super(ErrorCode.BAD_REQUEST, "Mã xác nhận không hợp lệ hoặc đã hết hạn");
        }
    }
}
