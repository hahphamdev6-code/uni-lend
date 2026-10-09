package com.unilend.backend.common.security;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Lấy người dùng đang đăng nhập từ SecurityContext.
 * Giả định: authentication.getName() là email của user
 * (JWT filter của phần auth cần set principal theo quy ước này).
 */
@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
    }

    public boolean isAdmin(User user) {
        return user.getRoles() != null && user.getRoles().contains("ADMIN");
    }

    public User requireAdmin() {
        User user = getCurrentUser();
        if (!isAdmin(user)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return user;
    }
}