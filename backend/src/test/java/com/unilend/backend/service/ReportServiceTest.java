package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.report.ReportCreateRequest;
import com.unilend.backend.dto.report.ReportResponse;
import com.unilend.backend.dto.report.ReportUpdateStatusRequest;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.Report;
import com.unilend.backend.entity.Report.ReportReason;
import com.unilend.backend.entity.Report.ReportStatus;
import com.unilend.backend.entity.Report.ReportTargetType;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.ReportRepository;
import com.unilend.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private ReportService reportService;

    private User reporter;
    private User owner;
    private User admin;
    private Item item;

    @BeforeEach
    void setUp() {
        reporter = User.builder().id(1L).email("reporter@unilend.test").fullName("Người báo cáo").build();
        owner = User.builder().id(2L).email("owner@unilend.test").fullName("Chủ món đồ").build();
        admin = User.builder().id(99L).email("admin@unilend.test").fullName("Quản trị viên")
                .roles(Set.of("USER", "ADMIN")).build();
        item = Item.builder().id(10L).title("Máy chiếu mini").owner(owner).build();
    }

    @Test
    void create_itemReport_success() {
        when(currentUserService.getCurrentUser()).thenReturn(reporter);
        when(itemRepository.findWithDetailsById(10L)).thenReturn(Optional.of(item));
        when(reportRepository.save(any(Report.class))).thenAnswer(inv -> {
            Report saved = inv.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        ReportCreateRequest req = new ReportCreateRequest(
                ReportTargetType.ITEM, 10L, null, null, ReportReason.INAPPROPRIATE, "  Tin đăng sai sự thật  ");

        ReportResponse res = reportService.create(req);

        assertEquals(100L, res.id());
        assertEquals(ReportTargetType.ITEM, res.targetType());
        assertEquals(ReportStatus.OPEN, res.status());
        assertEquals(ReportReason.INAPPROPRIATE, res.reason());
        assertEquals("Tin đăng sai sự thật", res.description());
        assertEquals(10L, res.reportedItem().id());
        assertEquals(2L, res.reportedUser().id());
    }

    @Test
    void create_ownItem_throwsBadRequest() {
        when(currentUserService.getCurrentUser()).thenReturn(owner);
        when(itemRepository.findWithDetailsById(10L)).thenReturn(Optional.of(item));

        ReportCreateRequest req = new ReportCreateRequest(
                ReportTargetType.ITEM, 10L, null, null, ReportReason.SPAM, "Tự báo cáo");

        BusinessException ex = assertThrows(BusinessException.class, () -> reportService.create(req));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
    }

    @Test
    void create_selfUserReport_throwsBadRequest() {
        when(currentUserService.getCurrentUser()).thenReturn(reporter);

        ReportCreateRequest req = new ReportCreateRequest(
                ReportTargetType.USER, 1L, null, null, ReportReason.HARASSMENT, "Tự báo cáo bản thân");

        BusinessException ex = assertThrows(BusinessException.class, () -> reportService.create(req));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
    }

    @Test
    void create_conflictingTargetIds_throwsBadRequest() {
        when(currentUserService.getCurrentUser()).thenReturn(reporter);

        ReportCreateRequest req = new ReportCreateRequest(
                ReportTargetType.ITEM, 10L, 11L, null, ReportReason.SPAM, "Báo cáo tin đăng");

        BusinessException ex = assertThrows(BusinessException.class, () -> reportService.create(req));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
    }

    @Test
    void create_targetTypeConflictsWithLegacyId_throwsBadRequest() {
        when(currentUserService.getCurrentUser()).thenReturn(reporter);

        ReportCreateRequest req = new ReportCreateRequest(
                ReportTargetType.ITEM, 10L, null, 2L, ReportReason.SPAM, "Báo cáo tin đăng");

        BusinessException ex = assertThrows(BusinessException.class, () -> reportService.create(req));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
    }

    @Test
    void updateStatus_toResolved_setsResolvedAtAndResolvedBy() {
        Report report = Report.builder()
                .id(100L)
                .reporter(reporter)
                .targetType(ReportTargetType.USER)
                .reportedUser(owner)
                .reason(ReportReason.FRAUD)
                .description("Lừa đảo")
                .status(ReportStatus.OPEN)
                .build();

        when(currentUserService.requireAdmin()).thenReturn(admin);
        when(reportRepository.findWithDetailsById(100L)).thenReturn(Optional.of(report));
        when(reportRepository.save(any(Report.class))).thenAnswer(inv -> inv.getArgument(0));

        ReportResponse res = reportService.updateStatus(
                100L, new ReportUpdateStatusRequest(ReportStatus.RESOLVED, "Đã kiểm tra và khóa tài khoản"));

        assertEquals(ReportStatus.RESOLVED, res.status());
        assertEquals("Đã kiểm tra và khóa tài khoản", res.resolutionNote());
        assertNotNull(res.resolvedAt());
        assertEquals(99L, res.resolvedBy().id());
    }

    @Test
    void updateStatus_toInReview_clearsResolutionDetails() {
        Report report = Report.builder()
                .id(100L)
                .reporter(reporter)
                .targetType(ReportTargetType.USER)
                .reportedUser(owner)
                .reason(ReportReason.FRAUD)
                .description("Lừa đảo")
                .status(ReportStatus.RESOLVED)
                .resolvedBy(admin)
                .resolvedAt(java.time.Instant.now())
                .build();

        when(currentUserService.requireAdmin()).thenReturn(admin);
        when(reportRepository.findWithDetailsById(100L)).thenReturn(Optional.of(report));
        when(reportRepository.save(any(Report.class))).thenAnswer(inv -> inv.getArgument(0));

        ReportResponse res = reportService.updateStatus(
                100L, new ReportUpdateStatusRequest(ReportStatus.IN_REVIEW, null));

        assertEquals(ReportStatus.IN_REVIEW, res.status());
        assertNull(res.resolvedBy());
        assertNull(res.resolvedAt());
    }
    @Test
    void create_duplicateActiveItemReport_throwsConflict() {
        when(currentUserService.getCurrentUser()).thenReturn(reporter);
        when(itemRepository.findWithDetailsById(10L)).thenReturn(Optional.of(item));
        when(reportRepository.existsByReporterIdAndTargetTypeAndReportedItemIdAndStatusIn(
                org.mockito.ArgumentMatchers.eq(1L),
                org.mockito.ArgumentMatchers.eq(ReportTargetType.ITEM),
                org.mockito.ArgumentMatchers.eq(10L),
                org.mockito.ArgumentMatchers.anyCollection())).thenReturn(true);

        ReportCreateRequest req = new ReportCreateRequest(
                ReportTargetType.ITEM, 10L, null, null, ReportReason.SPAM, "Báo cáo trùng");

        BusinessException ex = assertThrows(BusinessException.class, () -> reportService.create(req));
        assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
    }

    @Test
    void create_duplicateActiveUserReport_throwsConflict() {
        when(currentUserService.getCurrentUser()).thenReturn(reporter);
        when(userRepository.findById(2L)).thenReturn(Optional.of(owner));
        when(reportRepository.existsByReporterIdAndTargetTypeAndReportedUserIdAndStatusIn(
                org.mockito.ArgumentMatchers.eq(1L),
                org.mockito.ArgumentMatchers.eq(ReportTargetType.USER),
                org.mockito.ArgumentMatchers.eq(2L),
                org.mockito.ArgumentMatchers.anyCollection())).thenReturn(true);

        ReportCreateRequest req = new ReportCreateRequest(
                ReportTargetType.USER, 2L, null, null, ReportReason.HARASSMENT, "Báo cáo trùng người dùng");

        BusinessException ex = assertThrows(BusinessException.class, () -> reportService.create(req));
        assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
    }

    @Test
    void findAllForAdmin_requiresAdminRole() {
        when(currentUserService.requireAdmin()).thenThrow(new BusinessException(ErrorCode.FORBIDDEN));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> reportService.findAllForAdmin(ReportStatus.OPEN, null, null, null, 0, 10));
        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }
}