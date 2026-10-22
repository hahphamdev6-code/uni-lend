package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.auth.AuthResponse;
import com.unilend.backend.dto.auth.LoginRequest;
import com.unilend.backend.dto.auth.RegisterRequest;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private CurrentUserService currentUserService;
    @Mock private ReviewService reviewService;
    @Mock private AccountTokenService accountTokenService;

    @InjectMocks private AuthService authService;

    @Test
    void registerNormalizesEmailAndReturnsToken() {
        when(userRepository.existsByEmail("person@example.test")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(7L);
            return saved;
        });
        when(jwtService.generateToken(eq(7L), eq("person@example.test"), any())).thenReturn("signed-token");

        AuthResponse response = authService.register(
                new RegisterRequest(" PERSON@example.test ", "password123", " Person "));

        assertEquals("person@example.test", response.email());
        assertEquals("Person", response.fullName());
        assertEquals("signed-token", response.token());
        verify(passwordEncoder).encode("password123");
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmail("person@example.test")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.register(
                new RegisterRequest("PERSON@example.test", "password123", "Person")));

        assertEquals(ErrorCode.CONFLICT, exception.getErrorCode());
    }

    @Test
    void loginAuthenticatesNormalizedEmailAndReturnsToken() {
        User user = User.builder()
                .id(9L)
                .email("person@example.test")
                .fullName("Person")
                .build();
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("person@example.test", "password123"));
        when(userRepository.findByEmail("person@example.test")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(eq(9L), eq("person@example.test"), any())).thenReturn("signed-token");

        AuthResponse response = authService.login(new LoginRequest(" PERSON@example.test ", "password123"));

        assertEquals("signed-token", response.token());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void loginReturnsUnauthorizedForInvalidCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("invalid credentials"));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> authService.login(new LoginRequest("person@example.test", "wrong")));

        assertEquals(ErrorCode.UNAUTHORIZED, exception.getErrorCode());
    }
}
