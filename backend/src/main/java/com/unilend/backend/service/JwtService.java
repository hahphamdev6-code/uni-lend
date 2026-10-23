package com.unilend.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String base64Secret,
                      @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret));
        this.expirationMs = expirationMs;
    }

    public String generateToken(Long userId, String email) {
        return generateToken(userId, email, List.of("USER"), 0);
    }

    public String generateToken(Long userId, String email, List<String> roles) {
        return generateToken(userId, email, roles, 0);
    }

    public String generateToken(Long userId, String email, List<String> roles, int tokenVersion) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(email)
                .claim("uid", userId)
                .claim("roles", roles)
                .claim("tv", tokenVersion)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public int extractTokenVersion(String token) {
        Number tv = parseClaims(token).get("tv", Number.class);
        return tv == null ? 0 : tv.intValue();
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();
    }
}