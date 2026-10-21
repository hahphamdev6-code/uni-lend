package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private AdminUserService adminUserService;

    private User admin;

    @BeforeEach
    void setUp() {
        admin = User.builder().id(1L).email("admin@example.test").fullName("Admin").build();
        when(currentUserService.requireAdmin()).thenReturn(admin);
    }

    @Test
    void findAllTrimsKeywordAndCapsPageSize() {
        when(userRepository.searchUsers(eq("alice"), eq(false), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 50), 0));

        adminUserService.findAll("  alice  ", false, -2, 500);

        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(userRepository).searchUsers(eq("alice"), eq(false), pageable.capture());
        assertEquals(0, pageable.getValue().getPageNumber());
        assertEquals(50, pageable.getValue().getPageSize());
        assertEquals(Sort.by(Sort.Direction.DESC, "createdAt", "id"), pageable.getValue().getSort());
    }

    @Test
    void findAllRequiresAdmin() {
        when(currentUserService.requireAdmin()).thenThrow(new BusinessException(ErrorCode.FORBIDDEN));

        assertThrows(BusinessException.class, () -> adminUserService.findAll(null, null, 0, 10));

        verify(userRepository, never()).searchUsers(any(), any(), any());
    }

    @Test
    void lockUserDisablesTargetAccount() {
        User target = User.builder().id(2L).email("user@example.test").fullName("User").build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.save(target)).thenReturn(target);

        var response = adminUserService.lockUser(2L);

        assertFalse(target.isEnabled());
        assertFalse(response.enabled());
        verify(userRepository).save(target);
    }

    @Test
    void lockUserRejectsLockingCurrentAdmin() {
        assertThrows(BusinessException.class, () -> adminUserService.lockUser(1L));

        verify(userRepository, never()).findById(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void lockUserRejectsDisablingLastEnabledAdmin() {
        User lastAdmin = User.builder()
                .id(2L)
                .email("last-admin@example.test")
                .fullName("Last Admin")
                .roles(Set.of("ADMIN"))
                .build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(lastAdmin));
        when(userRepository.findAllByEnabledTrue()).thenReturn(List.of(lastAdmin));

        assertThrows(BusinessException.class, () -> adminUserService.lockUser(2L));

        assertTrue(lastAdmin.isEnabled());
        verify(userRepository, never()).save(any());
    }

    @Test
    void unlockUserEnablesTargetAccount() {
        User target = User.builder()
                .id(2L)
                .email("user@example.test")
                .fullName("User")
                .enabled(false)
                .build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.save(target)).thenReturn(target);

        var response = adminUserService.unlockUser(2L);

        assertTrue(target.isEnabled());
        assertTrue(response.enabled());
        verify(userRepository).save(target);
    }

    @Test
    void lockUserRejectsUnknownTarget() {
        when(userRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> adminUserService.lockUser(404L));

        verify(userRepository, never()).save(any());
    }
}
