package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
<<<<<<< HEAD
import com.unilend.backend.dto.auth.AuthResponse;
import com.unilend.backend.dto.auth.LoginRequest;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;

=======
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.auth.AuthResponse;
import com.unilend.backend.dto.auth.LoginRequest;
import com.unilend.backend.dto.auth.RegisterRequest;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

>>>>>>> feature/fe-item-manage-pages
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
<<<<<<< HEAD
    private final JwtEncoder jwtEncoder;

    @Value("${app.jwt.issuer:http://unilend.local}")
    private String issuer;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long expirationMillis;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().trim().toLowerCase(Locale.ROOT))
                .filter(candidate -> candidate.isEnabled()
                        && passwordEncoder.matches(request.password(), candidate.getPassword()))
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"));

        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusMillis(expirationMillis);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(user.getEmail())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return new AuthResponse(token, "Bearer", expiresAt);
=======
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Email đã được sử dụng");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.password())) // BCrypt
                .fullName(request.fullName().trim())
                .build();

        user = userRepository.save(user);
        return AuthResponse.of(user, jwtService.generateToken(user.getId(), user.getEmail(), user.getRoles().stream().toList()));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalize(request.email());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (AuthenticationException ex) {
            // Không tiết lộ là sai email hay sai mật khẩu
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Email hoặc mật khẩu không đúng");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"));
        return AuthResponse.of(user, jwtService.generateToken(user.getId(), user.getEmail(), user.getRoles().stream().toList()));
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser() {
        return AuthResponse.of(currentUserService.getCurrentUser());
    }

    private String normalize(String email) {
        return email.trim().toLowerCase();
>>>>>>> feature/fe-item-manage-pages
    }
}
