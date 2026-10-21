package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.user.AdminUserResponse;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> search(String keyword, int page, int size) {
        currentUserService.requireAdmin();
        if (page < 0 || size < 1 || size > 100) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Thông tin phân trang không hợp lệ");
        }

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String query = keyword == null ? "" : keyword.trim();
        Page<User> users = query.isEmpty()
                ? userRepository.findAll(pageable)
                : userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        query, query, pageable);

        return PageResponse.from(users, AdminUserResponse::from);
    }

    @Transactional
    public AdminUserResponse setEnabled(Long userId, boolean enabled) {
        User admin = currentUserService.requireAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("người dùng", userId));

        if (!enabled && admin.getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Bạn không thể tự khóa tài khoản của mình");
        }

        if (!enabled && user.getRoles().contains("ADMIN")) {
            long otherEnabledAdmins = userRepository.findAllByEnabledTrue().stream()
                    .filter(candidate -> !candidate.getId().equals(user.getId()))
                    .filter(candidate -> candidate.getRoles().contains("ADMIN"))
                    .count();
            if (otherEnabledAdmins == 0) {
                throw new BusinessException(
                        ErrorCode.BAD_REQUEST,
                        "Không thể khóa quản trị viên đang hoạt động cuối cùng");
            }
        }

        user.setEnabled(enabled);
        return AdminUserResponse.from(user);
    }
}
