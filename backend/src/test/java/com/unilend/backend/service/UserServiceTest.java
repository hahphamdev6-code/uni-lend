package com.unilend.backend.service;

import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.dto.user.ChangePasswordRequest;
import com.unilend.backend.dto.user.UserProfileResponse;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("user@unilend.test")
                .fullName("Nguyễn Văn A")
                .university("ĐH Bách Khoa")
                .build();
    }

    @Test
    void getById_includesAverageRatingAndReviewCount() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(reviewService.getAverageRating(1L)).thenReturn(4.5);
        when(reviewService.getReviewCount(1L)).thenReturn(8L);

        UserProfileResponse profile = userService.getById(1L);

        assertEquals(1L, profile.id());
        assertEquals("Nguyễn Văn A", profile.fullName());
        assertEquals(4.5, profile.averageRating());
        assertEquals(8L, profile.reviewCount());
    }
    @Test
    void getById_anonymousViewer_returnsPublicProfile() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(reviewService.getAverageRating(1L)).thenReturn(4.5);
        when(reviewService.getReviewCount(1L)).thenReturn(8L);
        when(currentUserService.getCurrentUser())
                .thenThrow(new BusinessException(ErrorCode.UNAUTHORIZED));

        UserProfileResponse profile = userService.getById(1L);

        assertEquals("Nguyễn Văn A", profile.fullName());
        assertNull(profile.email());
    }

    @Test
    void getMyProfile_includesAverageRatingAndReviewCount() {
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(reviewService.getAverageRating(1L)).thenReturn(5.0);
        when(reviewService.getReviewCount(1L)).thenReturn(2L);

        UserProfileResponse profile = userService.getMyProfile();

        assertEquals(1L, profile.id());
        assertEquals(5.0, profile.averageRating());
        assertEquals(2L, profile.reviewCount());
    }

    @Test
    void changeMyPasswordUsesEncoderAndInvalidatesExistingTokens() {
        user.setPassword("encoded-old-password");
        user.setTokenVersion(4);
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(passwordEncoder.matches("old-password", "encoded-old-password")).thenReturn(true);
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-new-password");

        userService.changeMyPassword(new ChangePasswordRequest("old-password", "new-password"));

        assertEquals("encoded-new-password", user.getPassword());
        assertEquals(5, user.getTokenVersion());
        verify(userRepository).save(user);
    }

    @Test
    void changeMyPasswordRejectsPlaintextStoredPasswordWithoutDirectComparison() {
        user.setPassword("legacy-plaintext");
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(passwordEncoder.matches("legacy-plaintext", "legacy-plaintext")).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.changeMyPassword(
                        new ChangePasswordRequest("legacy-plaintext", "new-password")));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getErrorCode());
        verify(userRepository, never()).save(user);
    }

    @Test
    void changeMyPasswordRejectsDisabledAccount() {
        user.setEnabled(false);
        when(currentUserService.getCurrentUser()).thenReturn(user);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> userService.changeMyPassword(new ChangePasswordRequest("old", "new-pass")));

        assertEquals(ErrorCode.FORBIDDEN, exception.getErrorCode());
        verify(passwordEncoder, never()).matches(org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyString());
        verify(userRepository, never()).save(user);
    }
    @Test
    void getById_forOtherRegularUser_hidesPrivateFields() {
        user.setPhone("0912345678");
        User viewer = User.builder().id(2L).email("viewer@unilend.test").fullName("Người xem").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(reviewService.getAverageRating(1L)).thenReturn(4.5);
        when(reviewService.getReviewCount(1L)).thenReturn(8L);
        when(currentUserService.getCurrentUser()).thenReturn(viewer);
        when(currentUserService.isAdmin(viewer)).thenReturn(false);

        UserProfileResponse profile = userService.getById(1L);

        assertEquals(1L, profile.id());
        assertEquals("Nguyễn Văn A", profile.fullName());
        org.junit.jupiter.api.Assertions.assertNull(profile.email());
        org.junit.jupiter.api.Assertions.assertNull(profile.phone());
        org.junit.jupiter.api.Assertions.assertNull(profile.roles());
    }

    @Test
    void getById_forAdminViewer_includesPrivateFields() {
        user.setPhone("0912345678");
        User admin = User.builder().id(99L).email("admin@unilend.test").fullName("Admin").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(reviewService.getAverageRating(1L)).thenReturn(4.5);
        when(reviewService.getReviewCount(1L)).thenReturn(8L);
        when(currentUserService.getCurrentUser()).thenReturn(admin);
        when(currentUserService.isAdmin(admin)).thenReturn(true);

        UserProfileResponse profile = userService.getById(1L);

        assertEquals("user@unilend.test", profile.email());
        assertEquals("0912345678", profile.phone());
    }
}
