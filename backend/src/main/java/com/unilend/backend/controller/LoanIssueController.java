package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.issue.*;
import com.unilend.backend.entity.LoanIssueStatus;
import com.unilend.backend.service.LoanIssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Loan Issues", description = "Quản lý hồ sơ sự cố lượt mượn")
@RestController
@RequiredArgsConstructor
public class LoanIssueController {

    private final LoanIssueService loanIssueService;
    private final CurrentUserService currentUserService;

    @Operation(summary = "Mở hồ sơ sự cố cho lượt mượn (chỉ borrower hoặc owner)")
    @PostMapping({"/api/loans/{loanId}/issues", "/loans/{loanId}/issues", "/api/loan-requests/{loanId}/issues"})
    public ResponseEntity<ApiResponse<LoanIssueResponse>> createIssue(
            @PathVariable Long loanId,
            @Valid @RequestBody LoanIssueCreateRequest request) {
        LoanIssueResponse body = loanIssueService.createIssue(
                loanId, request, currentUserService.getCurrentUser());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Báo cáo sự cố thành công", body));
    }

    @Operation(summary = "Xem danh sách sự cố của lượt mượn (chỉ borrower, owner hoặc ADMIN)")
    @GetMapping({"/api/loans/{loanId}/issues", "/loans/{loanId}/issues", "/api/loan-requests/{loanId}/issues"})
    public ApiResponse<PageResponse<LoanIssueResponse>> getIssuesByLoan(
            @PathVariable Long loanId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.ok(loanIssueService.getIssuesByLoan(
                loanId, currentUserService.getCurrentUser(), pageable));
    }

    @Operation(summary = "Xem chi tiết sự cố theo ID (chỉ borrower, owner hoặc ADMIN)")
    @GetMapping({"/api/loan-issues/{id}", "/loan-issues/{id}", "/api/issues/{id}"})
    public ApiResponse<LoanIssueResponse> getIssueById(@PathVariable Long id) {
        return ApiResponse.ok(loanIssueService.getIssueById(
                id, currentUserService.getCurrentUser()));
    }

    @Operation(summary = "Xem danh sách sự cố liên quan đến người dùng hiện tại")
    @GetMapping({"/api/loan-issues/mine", "/loan-issues/mine"})
    public ApiResponse<PageResponse<LoanIssueResponse>> getMyIssues(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.ok(loanIssueService.getMyIssues(
                currentUserService.getCurrentUser(), pageable));
    }

    @Operation(summary = "ADMIN: Xem toàn bộ sự cố trong hệ thống")
    @GetMapping({"/api/admin/loan-issues", "/admin/loan-issues"})
    public ApiResponse<PageResponse<LoanIssueResponse>> getAllIssuesForAdmin(
            @RequestParam(required = false) LoanIssueStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.ok(loanIssueService.getAllIssuesForAdmin(
                status, pageable, currentUserService.getCurrentUser()));
    }

    @Operation(summary = "ADMIN: Phân quyền xử lý sự cố (chuyển trạng thái, quyết định, chặn cập nhật chồng lấn)")
    @PatchMapping({"/api/loan-issues/{id}/process", "/loan-issues/{id}/process", "/api/admin/loan-issues/{id}/process"})
    public ApiResponse<LoanIssueResponse> processIssue(
            @PathVariable Long id,
            @Valid @RequestBody LoanIssueProcessRequest request) {
        LoanIssueResponse body = loanIssueService.processIssue(
                id, request, currentUserService.getCurrentUser());
        return ApiResponse.ok("Xử lý sự cố thành công", body);
    }

    @Operation(summary = "Cập nhật nội dung mô tả sự cố (kiểm tra quyền và chặn sửa lịch sử sau khi đóng)")
    @PatchMapping({"/api/loan-issues/{id}", "/loan-issues/{id}", "/api/issues/{id}"})
    public ApiResponse<LoanIssueResponse> updateIssueContent(
            @PathVariable Long id,
            @Valid @RequestBody LoanIssueUpdateRequest request) {
        LoanIssueResponse body = loanIssueService.updateIssueContent(
                id, request, currentUserService.getCurrentUser());
        return ApiResponse.ok("Cập nhật nội dung sự cố thành công", body);
    }
}
