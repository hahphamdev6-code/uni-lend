package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.issue.LoanIssueCreateRequest;
import com.unilend.backend.dto.issue.LoanIssueProcessRequest;
import com.unilend.backend.dto.issue.LoanIssueResponse;
import com.unilend.backend.dto.issue.LoanIssueUpdateRequest;
import com.unilend.backend.entity.*;
import com.unilend.backend.entity.Notification.NotificationType;
import com.unilend.backend.repository.LoanIssueHistoryRepository;
import com.unilend.backend.repository.LoanIssueRepository;
import com.unilend.backend.repository.LoanRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoanIssueServiceTest {

    @Mock
    private LoanIssueRepository loanIssueRepository;
    @Mock
    private LoanIssueHistoryRepository loanIssueHistoryRepository;
    @Mock
    private LoanRequestRepository loanRequestRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private LoanIssueService loanIssueService;

    private User borrower;
    private User owner;
    private User stranger;
    private User admin;
    private Item item;
    private LoanRequest loanRequest;
    private LoanIssue openIssue;

    @BeforeEach
    void setUp() {
        borrower = User.builder().id(1L).email("borrower@test.com").fullName("Borrower User").roles(Set.of("USER")).build();
        owner = User.builder().id(2L).email("owner@test.com").fullName("Owner User").roles(Set.of("USER")).build();
        stranger = User.builder().id(3L).email("stranger@test.com").fullName("Stranger User").roles(Set.of("USER")).build();
        admin = User.builder().id(4L).email("admin@test.com").fullName("Admin User").roles(Set.of("ADMIN", "USER")).build();

        item = Item.builder().id(10L).title("Sony Camera").owner(owner).build();
        loanRequest = LoanRequest.builder().id(100L).borrower(borrower).item(item).build();

        openIssue = LoanIssue.builder()
                .id(50L)
                .loanRequest(loanRequest)
                .reportedBy(borrower)
                .type(LoanIssueType.DAMAGE)
                .description("Ống kính bị trầy xước nặng")
                .status(LoanIssueStatus.OPEN)
                .version(0L)
                .updatedAt(Instant.now())
                .build();
    }

    @Nested
    @DisplayName("feature/be-loan-issues: Hồ sơ sự cố & Khởi tạo")
    class LoanIssueRecords {

        @Test
        @DisplayName("Borrower tạo hồ sơ sự cố thành công với đầy đủ thông tin")
        void createIssue_byBorrower_success() {
            when(loanRequestRepository.findById(100L)).thenReturn(Optional.of(loanRequest));
            when(loanIssueRepository.save(any(LoanIssue.class))).thenAnswer(invocation -> {
                LoanIssue issue = invocation.getArgument(0);
                issue.setId(50L);
                return issue;
            });

            LoanIssueCreateRequest request = LoanIssueCreateRequest.builder()
                    .type(LoanIssueType.DAMAGE)
                    .description("Ống kính bị trầy xước nặng")
                    .build();

            LoanIssueResponse response = loanIssueService.createIssue(100L, request, borrower);

            assertNotNull(response);
            assertEquals(50L, response.getId());
            assertEquals(LoanIssueType.DAMAGE, response.getType());
            assertEquals("Ống kính bị trầy xước nặng", response.getDescription());
            assertEquals(LoanIssueStatus.OPEN, response.getStatus());
            assertEquals(1L, response.getBorrowerId());
            assertEquals(2L, response.getOwnerId());
            assertEquals(1L, response.getReportedById());

            // Kiểm tra lưu lịch sử
            verify(loanIssueHistoryRepository, times(1)).save(argThat(h ->
                    h.getAction().equals("CREATED") && h.getToStatus() == LoanIssueStatus.OPEN));

            // Kiểm tra gửi notification cho Owner
            verify(notificationService, times(1)).notify(
                    eq(owner.getId()),
                    eq(NotificationType.LOAN_ISSUE_CREATED),
                    contains("Người mượn Borrower User đã báo cáo sự cố"),
                    contains("/loans/100/issues/50")
            );
        }

        @Test
        @DisplayName("Owner tạo hồ sơ sự cố thành công và gửi notification cho Borrower")
        void createIssue_byOwner_success() {
            when(loanRequestRepository.findById(100L)).thenReturn(Optional.of(loanRequest));
            when(loanIssueRepository.save(any(LoanIssue.class))).thenAnswer(invocation -> {
                LoanIssue issue = invocation.getArgument(0);
                issue.setId(51L);
                return issue;
            });

            LoanIssueCreateRequest request = LoanIssueCreateRequest.builder()
                    .type(LoanIssueType.LOST)
                    .description("Người mượn làm mất phụ kiện cáp sạc")
                    .build();

            LoanIssueResponse response = loanIssueService.createIssue(100L, request, owner);

            assertNotNull(response);
            assertEquals(51L, response.getId());
            assertEquals(2L, response.getReportedById());

            // Gửi notification cho Borrower
            verify(notificationService, times(1)).notify(
                    eq(borrower.getId()),
                    eq(NotificationType.LOAN_ISSUE_CREATED),
                    contains("Chủ sở hữu Owner User đã báo cáo sự cố"),
                    contains("/loans/100/issues/51")
            );
        }
    }

    @Nested
    @DisplayName("feature/be-loan-issue-permissions: Phân quyền & Chặn thao tác trái phép")
    class LoanIssuePermissions {

        @Test
        @DisplayName("Người lạ (không phải borrower/owner) không được mở sự cố -> FORBIDDEN")
        void createIssue_byStranger_forbidden() {
            when(loanRequestRepository.findById(100L)).thenReturn(Optional.of(loanRequest));

            LoanIssueCreateRequest request = LoanIssueCreateRequest.builder()
                    .type(LoanIssueType.OTHER)
                    .description("Báo cáo trái phép")
                    .build();

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> loanIssueService.createIssue(100L, request, stranger));

            assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
            verify(loanIssueRepository, never()).save(any());
        }

        @Test
        @DisplayName("Người lạ không được xem sự cố của lượt mượn -> FORBIDDEN")
        void getIssuesByLoan_byStranger_forbidden() {
            when(loanRequestRepository.findById(100L)).thenReturn(Optional.of(loanRequest));
            when(currentUserService.isAdmin(stranger)).thenReturn(false);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> loanIssueService.getIssuesByLoan(100L, stranger, PageRequest.of(0, 10)));

            assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
        }

        @Test
        @DisplayName("Borrower, Owner và ADMIN đều được xem sự cố của lượt mượn")
        void getIssuesByLoan_authorizedUsers_success() {
            when(loanRequestRepository.findById(100L)).thenReturn(Optional.of(loanRequest));
            when(loanIssueRepository.findByLoanRequestId(eq(100L), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(openIssue)));

            // Borrower
            var page1 = loanIssueService.getIssuesByLoan(100L, borrower, PageRequest.of(0, 10));
            assertEquals(1, page1.totalElements());

            // Owner
            var page2 = loanIssueService.getIssuesByLoan(100L, owner, PageRequest.of(0, 10));
            assertEquals(1, page2.totalElements());

            // Admin
            when(currentUserService.isAdmin(admin)).thenReturn(true);
            var page3 = loanIssueService.getIssuesByLoan(100L, admin, PageRequest.of(0, 10));
            assertEquals(1, page3.totalElements());
        }

        @Test
        @DisplayName("Người dùng không phải ADMIN cố tình xử lý sự cố -> FORBIDDEN")
        void processIssue_nonAdmin_forbidden() {
            when(currentUserService.isAdmin(borrower)).thenReturn(false);

            LoanIssueProcessRequest request = LoanIssueProcessRequest.builder()
                    .status(LoanIssueStatus.RESOLVED)
                    .decisionNote("Tự duyệt")
                    .build();

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> loanIssueService.processIssue(50L, request, borrower));

            assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
            verify(loanIssueRepository, never()).save(any());
        }

        @Test
        @DisplayName("ADMIN xử lý sự cố thành công từ OPEN sang IN_PROGRESS và RESOLVED")
        void processIssue_byAdmin_success() {
            when(currentUserService.isAdmin(admin)).thenReturn(true);
            when(loanIssueRepository.findById(50L)).thenReturn(Optional.of(openIssue));
            when(loanIssueRepository.save(any(LoanIssue.class))).thenAnswer(i -> i.getArgument(0));

            LoanIssueProcessRequest request = LoanIssueProcessRequest.builder()
                    .status(LoanIssueStatus.RESOLVED)
                    .decisionNote("Đã thỏa thuận bồi thường chi phí sửa chữa")
                    .version(0L)
                    .build();

            LoanIssueResponse response = loanIssueService.processIssue(50L, request, admin);

            assertEquals(LoanIssueStatus.RESOLVED, response.getStatus());
            assertEquals("Đã thỏa thuận bồi thường chi phí sửa chữa", response.getDecisionNote());
            assertEquals(admin.getId(), response.getResolvedById());
            assertNotNull(response.getResolvedAt());

            // Verify notifications gửi cho cả borrower và owner
            verify(notificationService, times(1)).notify(
                    eq(borrower.getId()),
                    eq(NotificationType.LOAN_ISSUE_RESOLVED),
                    contains("đã chuyển trạng thái sang Đã giải quyết"),
                    anyString()
            );
            verify(notificationService, times(1)).notify(
                    eq(owner.getId()),
                    eq(NotificationType.LOAN_ISSUE_RESOLVED),
                    contains("đã chuyển trạng thái sang Đã giải quyết"),
                    anyString()
            );
        }

        @Test
        @DisplayName("Chặn thao tác trái trạng thái: không thể chuyển từ CLOSED sang trạng thái khác -> CONFLICT")
        void processIssue_fromClosed_conflict() {
            openIssue.setStatus(LoanIssueStatus.CLOSED);
            when(currentUserService.isAdmin(admin)).thenReturn(true);
            when(loanIssueRepository.findById(50L)).thenReturn(Optional.of(openIssue));

            LoanIssueProcessRequest request = LoanIssueProcessRequest.builder()
                    .status(LoanIssueStatus.OPEN)
                    .decisionNote("Mở lại")
                    .build();

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> loanIssueService.processIssue(50L, request, admin));

            assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
            assertTrue(ex.getMessage().contains("CLOSED"));
        }

        @Test
        @DisplayName("Chặn thao tác trái trạng thái: không thể chuyển từ IN_PROGRESS lùi về OPEN -> CONFLICT")
        void processIssue_inProgressToOpen_conflict() {
            openIssue.setStatus(LoanIssueStatus.IN_PROGRESS);
            when(currentUserService.isAdmin(admin)).thenReturn(true);
            when(loanIssueRepository.findById(50L)).thenReturn(Optional.of(openIssue));

            LoanIssueProcessRequest request = LoanIssueProcessRequest.builder()
                    .status(LoanIssueStatus.OPEN)
                    .build();

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> loanIssueService.processIssue(50L, request, admin));

            assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
        }

        @Test
        @DisplayName("Chặn cập nhật chồng lấn: sai version optimistic locking -> CONFLICT")
        void processIssue_versionMismatch_conflict() {
            openIssue.setVersion(2L);
            when(currentUserService.isAdmin(admin)).thenReturn(true);
            when(loanIssueRepository.findById(50L)).thenReturn(Optional.of(openIssue));

            LoanIssueProcessRequest request = LoanIssueProcessRequest.builder()
                    .status(LoanIssueStatus.RESOLVED)
                    .decisionNote("Xử lý với stale version")
                    .version(1L) // Stale version != 2L
                    .build();

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> loanIssueService.processIssue(50L, request, admin));

            assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
            assertTrue(ex.getMessage().contains("xung đột phiên bản"));
            verify(loanIssueRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("feature/be-loan-issue-notifications: Thông báo & Bảo vệ lịch sử khi đã đóng")
    class NotificationsAndImmutability {

        @Test
        @DisplayName("Không cho sửa nội dung khi sự cố đã ĐÓNG (CLOSED) nếu không có quyền phù hợp -> FORBIDDEN")
        void updateIssueContent_whenClosed_nonAdmin_forbidden() {
            openIssue.setStatus(LoanIssueStatus.CLOSED);
            when(loanIssueRepository.findById(50L)).thenReturn(Optional.of(openIssue));
            when(currentUserService.isAdmin(borrower)).thenReturn(false);

            LoanIssueUpdateRequest request = LoanIssueUpdateRequest.builder()
                    .description("Sửa mô tả sau khi đã đóng")
                    .build();

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> loanIssueService.updateIssueContent(50L, request, borrower));

            assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
            assertTrue(ex.getMessage().contains("Sự cố đã được đóng"));
            verify(loanIssueRepository, never()).save(any());
        }

        @Test
        @DisplayName("ADMIN có quyền phù hợp được phép chỉnh sửa nội dung lịch sử khi sự cố đã đóng")
        void updateIssueContent_whenClosed_admin_success() {
            openIssue.setStatus(LoanIssueStatus.CLOSED);
            when(loanIssueRepository.findById(50L)).thenReturn(Optional.of(openIssue));
            when(currentUserService.isAdmin(admin)).thenReturn(true);
            when(loanIssueRepository.save(any(LoanIssue.class))).thenAnswer(i -> i.getArgument(0));

            LoanIssueUpdateRequest request = LoanIssueUpdateRequest.builder()
                    .description("Bổ sung thông tin đối soát sau khi đóng")
                    .build();

            LoanIssueResponse response = loanIssueService.updateIssueContent(50L, request, admin);

            assertEquals("Bổ sung thông tin đối soát sau khi đóng", response.getDescription());
            verify(loanIssueHistoryRepository, times(1)).save(argThat(h ->
                    h.getAction().equals("HISTORY_AMENDED")));
        }

        @Test
        @DisplayName("Reporter được sửa mô tả khi sự cố còn OPEN")
        void updateIssueContent_reporter_whenOpen_success() {
            when(loanIssueRepository.findById(50L)).thenReturn(Optional.of(openIssue));
            when(currentUserService.isAdmin(borrower)).thenReturn(false);
            when(loanIssueRepository.save(any(LoanIssue.class))).thenAnswer(i -> i.getArgument(0));

            LoanIssueUpdateRequest request = LoanIssueUpdateRequest.builder()
                    .description("Cập nhật chi tiết thêm vết trầy")
                    .build();

            LoanIssueResponse response = loanIssueService.updateIssueContent(50L, request, borrower);

            assertEquals("Cập nhật chi tiết thêm vết trầy", response.getDescription());
            verify(loanIssueHistoryRepository, times(1)).save(argThat(h ->
                    h.getAction().equals("CONTENT_UPDATED")));
        }

        @Test
        @DisplayName("Reporter không được sửa mô tả khi sự cố đã sang IN_PROGRESS hoặc RESOLVED -> FORBIDDEN")
        void updateIssueContent_reporter_whenInProgress_forbidden() {
            openIssue.setStatus(LoanIssueStatus.IN_PROGRESS);
            when(loanIssueRepository.findById(50L)).thenReturn(Optional.of(openIssue));
            when(currentUserService.isAdmin(borrower)).thenReturn(false);

            LoanIssueUpdateRequest request = LoanIssueUpdateRequest.builder()
                    .description("Cố tình sửa khi đang xử lý")
                    .build();

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> loanIssueService.updateIssueContent(50L, request, borrower));

            assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
            verify(loanIssueRepository, never()).save(any());
        }
    }
}
