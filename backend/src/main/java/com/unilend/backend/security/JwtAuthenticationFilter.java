package com.unilend.backend.security;

import com.unilend.backend.entity.User;
import com.unilend.backend.repository.UserRepository;
import com.unilend.backend.service.CustomUserDetailsService;
import com.unilend.backend.service.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER = "Bearer ";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith(BEARER)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = header.substring(BEARER.length());
            try {
                String email = jwtService.extractEmail(token);
                int tokenVersion = jwtService.extractTokenVersion(token);

                User domainUser = userRepository.findByEmail(email).orElse(null);
                if (domainUser != null
                        && domainUser.isEnabled()
                        && domainUser.getTokenVersion() == tokenVersion) {
                    UserDetails user = userDetailsService.loadUserByUsername(email);
                    if (user.isEnabled()) {
                        var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (JwtException | IllegalArgumentException | AuthenticationException ignored) {
            }
        }
        chain.doFilter(request, response);
    }
}