package com.unilend.backend.common.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.time.Instant;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SecurityConfigTest {

    private static final String ISSUER = "http://unilend.local";
    private static final String SECRET = Base64.getEncoder().encodeToString(
            "0123456789abcdef0123456789abcdef".getBytes());

    private final SecurityConfig securityConfig = new SecurityConfig();

    @Test
    void decoderAcceptsHs256TokenSignedWithConfiguredSecret() {
        var key = securityConfig.jwtSigningKey(SECRET);
        var encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject("user@unilend.test")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(60))
                .build();
        String token = encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();

        var decoded = securityConfig.jwtDecoder(key, ISSUER).decode(token);

        assertEquals("user@unilend.test", decoded.getSubject());
    }

    @Test
    void signingKeyRequiresValidBase64WithAtLeast32Bytes() {
        assertThrows(IllegalStateException.class, () -> securityConfig.jwtSigningKey(""));
        assertThrows(IllegalStateException.class, () -> securityConfig.jwtSigningKey("not-base64"));
        assertThrows(IllegalStateException.class, () -> securityConfig.jwtSigningKey(
                Base64.getEncoder().encodeToString("short-key".getBytes())));
    }

    @Test
    void corsConfigurationAllowsPatchRequests() {
        var corsConfiguration = securityConfig.corsConfigurationSource("http://localhost:3000")
                .getCorsConfiguration(new MockHttpServletRequest("PATCH", "/api/admin/users/2/lock"));

        assertTrue(corsConfiguration.getAllowedMethods().contains("PATCH"));
    }

    @Test
    void decoderRejectsTokenWithDifferentIssuer() {
        var key = securityConfig.jwtSigningKey(SECRET);
        var encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("http://other-issuer.local")
                .subject("user@unilend.test")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(60))
                .build();
        String token = encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();

        assertThrows(JwtException.class, () -> securityConfig.jwtDecoder(key, ISSUER).decode(token));
    }
}
