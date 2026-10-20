package com.unilend.backend.service;

import com.unilend.backend.common.security.CurrentUserService;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
        when(reviewService.getAverageRating(1L)).thenReturn(4.5);
        when(reviewService.getReviewCount(1L)).thenReturn(8L);

        UserProfileResponse profile = userService.getById(1L);

        assertEquals(1L, profile.id());
        assertEquals("Nguyễn Văn A", profile.fullName());
        assertEquals(4.5, profile.averageRating());
        assertEquals(8L, profile.reviewCount());
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
}
