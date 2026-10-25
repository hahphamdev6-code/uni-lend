package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.user.ChangePasswordRequest;
import com.unilend.backend.dto.user.PublicUserProfileResponse;
import com.unilend.backend.dto.user.UpdateProfileRequest;
import com.unilend.backend.dto.user.UserProfileResponse;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;
    private final ReviewService reviewService;

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile() {
        User user = currentUserService.getCurrentUser();
        return toProfileResponse(user);
    }

    @Transactional(readOnly = true)
    public PublicUserProfileResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return PublicUserProfileResponse.from(user,
                reviewService.getAverageRating(user.getId()), reviewService.getReviewCount(user.getId()));
    }

    @Transactional
    public UserProfileResponse updateMyProfile(UpdateProfileRequest req) {
        User user = currentUserService.getCurrentUser();

        user.setFullName(req.fullName().trim());
        user.setPhone(req.phone() == null || req.phone().isBlank() ? null : req.phone().trim());
        user.setUniversity(req.university() == null || req.university().isBlank() ? null : req.university().trim());
        if (req.avatarUrl() != null) {
            user.setAvatarUrl(req.avatarUrl().isBlank() ? null : req.avatarUrl().trim());
        }

        User saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    @Transactional
    public void changeMyPassword(ChangePasswordRequest req) {
        User user = currentUserService.getCurrentUser();
        if (!user.isEnabled()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Tài khoản đã bị khóa");
        }

        if (!passwordEncoder.matches(req.oldPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Mật khẩu cũ không chính xác");
        }

        if (req.oldPassword().equals(req.newPassword())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Mật khẩu mới không được trùng với mật khẩu cũ");
        }

        user.setPassword(passwordEncoder.encode(req.newPassword()));
        user.incrementTokenVersion();
        userRepository.save(user);
    }

    private UserProfileResponse toProfileResponse(User user) {
        double avgRating = reviewService.getAverageRating(user.getId());
        long reviewCount = reviewService.getReviewCount(user.getId());
        return UserProfileResponse.from(user, avgRating, reviewCount);
    }
}
