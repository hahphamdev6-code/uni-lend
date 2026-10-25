package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.user.UserProfileResponse;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private static final int MAX_PAGE_SIZE = 50;
    private static final String AUDIT_REASON = "Admin account moderation action";

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public PageResponse<UserProfileResponse> findAll(String keyword, Boolean enabled, int page, int size) {
        currentUserService.requireAdmin();
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        return PageResponse.from(
                userRepository.searchUsers(kw, enabled, pageable(page, size)),
                UserProfileResponse::from);
    }

    @Transactional
    public UserProfileResponse lockUser(Long targetUserId) {
        return lockUser(targetUserId, null);
    }

    @Transactional
    public UserProfileResponse lockUser(Long targetUserId, String reason) {
        User admin = currentUserService.requireAdmin();
        if (admin.getId().equals(targetUserId)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Không thể tự khóa tài khoản của chính mình");
        }
        User target = getOrThrow(targetUserId);
        if (target.isEnabled() && target.getRoles().contains("ADMIN")) {
            boolean anotherEnabledAdminExists = userRepository.findAllByEnabledTrue().stream()
                    .anyMatch(user -> !user.getId().equals(targetUserId)
                            && user.getRoles().contains("ADMIN"));
            if (!anotherEnabledAdminExists) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Không thể khóa quản trị viên đang hoạt động cuối cùng");
            }
        }
        if (target.isEnabled()) {
            target.setEnabled(false);
            target.incrementTokenVersion();
            auditLogService.record(admin, "USER_LOCKED", "USER", target.getId(), AUDIT_REASON);
            userRepository.save(target);
        }
        return UserProfileResponse.from(target);
    }

    @Transactional
    public UserProfileResponse unlockUser(Long targetUserId) {
        return unlockUser(targetUserId, null);
    }

    @Transactional
    public UserProfileResponse unlockUser(Long targetUserId, String reason) {
        User admin = currentUserService.requireAdmin();
        User target = getOrThrow(targetUserId);
        if (!target.isEnabled()) {
            target.setEnabled(true);
            target.incrementTokenVersion();
            auditLogService.record(admin, "USER_UNLOCKED", "USER", target.getId(), AUDIT_REASON);
            userRepository.save(target);
        }
        return UserProfileResponse.from(target);
    }

    private User getOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("người dùng", id));
    }

    private Pageable pageable(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
    }
}
