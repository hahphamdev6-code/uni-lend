package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.auth.*;
import com.unilend.backend.entity.AccountToken.TokenType;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;
    private final ReviewService reviewService;
    private final AccountTokenService accountTokenService;
    private final EmailService emailService;
    private final RateLimitService rateLimitService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.email());
        rateLimitService.checkEmailRateLimit("register", email);

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Email đã được sử dụng");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        String rawToken = accountTokenService.createEmailVerificationToken(user);
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), rawToken);

        return AuthResponse.of(user, jwtService.generateToken(
                user.getId(), user.getEmail(), user.getRoles().stream().toList(), user.getTokenVersion()));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalize(request.email());
        rateLimitService.checkLoginRateLimit(email);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (AuthenticationException ex) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Email hoặc mật khẩu không đúng");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"));
        if (!user.isEnabled()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Tài khoản đã bị khóa");
        }
        return AuthResponse.of(user, jwtService.generateToken(
                user.getId(), user.getEmail(), user.getRoles().stream().toList(), user.getTokenVersion()));
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        User user = accountTokenService.consumeToken(request.token(), TokenType.EMAIL_VERIFICATION);
        if (!user.isEnabled()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Tài khoản đã bị khóa");
        }
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerificationEmail(ForgotPasswordRequest request) {
        String email = normalize(request.email());
        rateLimitService.checkEmailRateLimit("resend-verify", email);

        userRepository.findByEmail(email)
                .filter(User::isEnabled)
                .filter(u -> !u.isEmailVerified())
                .ifPresent(user -> {
                    String rawToken = accountTokenService.createEmailVerificationToken(user);
                    emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), rawToken);
                });
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = normalize(request.email());
        rateLimitService.checkEmailRateLimit("forgot-password", email);

        userRepository.findByEmail(email)
                .filter(User::isEnabled)
                .ifPresent(user -> {
                    String rawToken = accountTokenService.createPasswordResetToken(user);
                    emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), rawToken);
                });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = accountTokenService.consumeToken(request.token(), TokenType.PASSWORD_RESET);
        if (!user.isEnabled()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Tài khoản đã bị khóa");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.incrementTokenVersion();
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser() {
        User user = currentUserService.getCurrentUser();
        double avgRating = reviewService.getAverageRating(user.getId());
        long reviewCount = reviewService.getReviewCount(user.getId());
        return AuthResponse.of(user, avgRating, reviewCount);
    }

    private String normalize(String email) {
        return email.trim().toLowerCase();
    }
}