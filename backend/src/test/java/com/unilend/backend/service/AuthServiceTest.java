package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.dto.auth.AuthResponse;
import com.unilend.backend.dto.auth.LoginRequest;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtEncoder jwtEncoder;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void configureJwtClaims() {
        ReflectionTestUtils.setField(authService, "issuer", "https://unilend.test");
        ReflectionTestUtils.setField(authService, "expirationMillis", 3_600_000L);
    }

    @Test
    void loginReturnsBearerTokenForEnabledUserWithValidPassword() {
        User user = User.builder()
                .email("person@example.test")
                .password("encoded-password")
                .enabled(true)
                .build();
        when(userRepository.findByEmail("person@example.test")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("plain-password", "encoded-password")).thenReturn(true);
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenAnswer(invocation -> {
            JwtEncoderParameters parameters = invocation.getArgument(0);
            return Jwt.withTokenValue("signed-token")
                    .header("alg", "HS256")
                    .claims(claims -> claims.putAll(parameters.getClaims().getClaims()))
                    .build();
        });

        AuthResponse response = authService.login(
                new LoginRequest(" PERSON@example.test ", "plain-password"));

        assertEquals("signed-token", response.accessToken());
        assertEquals("Bearer", response.tokenType());
        assertEquals(Instant.now().plusMillis(3_600_000L).getEpochSecond(),
                response.expiresAt().getEpochSecond(), 2);

        ArgumentCaptor<JwtEncoderParameters> parameters = ArgumentCaptor.forClass(JwtEncoderParameters.class);
        verify(jwtEncoder).encode(parameters.capture());
        assertEquals("person@example.test", parameters.getValue().getClaims().getSubject());
        assertEquals("https://unilend.test", parameters.getValue().getClaims().getIssuer().toString());
    }

    @Test
    void loginRejectsUnknownUserOrInvalidPassword() {
        when(userRepository.findByEmail("unknown@example.test")).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> authService.login(
                new LoginRequest("unknown@example.test", "wrong-password")));
    }
}
