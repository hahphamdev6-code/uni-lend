package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.loan.LoanRequestCreateRequest;
import com.unilend.backend.dto.loan.LoanRequestResponse;
import com.unilend.backend.entity.LoanRequest.LoanStatus;
import com.unilend.backend.service.LoanRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/loan-requests")
@RequiredArgsConstructor
public class LoanRequestController {

    private final LoanRequestService loanRequestService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<ApiResponse<LoanRequestResponse>> create(
            @Valid @RequestBody LoanRequestCreateRequest request) {
        LoanRequestResponse body = loanRequestService.create(currentUserService.getCurrentUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Gửi yêu cầu mượn thành công", body));
    }

    @GetMapping("/mine")
    public ApiResponse<PagedModel<LoanRequestResponse>> mine(
            @RequestParam(required = false) LoanStatus status,
            @PageableDefault(size = 10, sort = "requestedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.ok(new PagedModel<>(
                loanRequestService.getMyRequests(currentUserService.getCurrentUser(), status, pageable)));
    }

    @GetMapping("/incoming")
    public ApiResponse<PagedModel<LoanRequestResponse>> incoming(
            @RequestParam(required = false) LoanStatus status,
            @PageableDefault(size = 10, sort = "requestedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.ok(new PagedModel<>(
                loanRequestService.getIncomingRequests(currentUserService.getCurrentUser(), status, pageable)));
    }

    @GetMapping("/overdue")
    public ApiResponse<PagedModel<LoanRequestResponse>> overdue(
            @PageableDefault(size = 10, sort = "dueDate") Pageable pageable) {
        return ApiResponse.ok(new PagedModel<>(
                loanRequestService.getOverdue(currentUserService.getCurrentUser(), pageable)));
    }

    @GetMapping("/{id}")
    public ApiResponse<LoanRequestResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(loanRequestService.getById(id, currentUserService.getCurrentUser()));
    }

    @PatchMapping("/{id}/approve")
    public ApiResponse<LoanRequestResponse> approve(@PathVariable Long id) {
        return ApiResponse.ok("Đã duyệt yêu cầu",
                loanRequestService.approve(id, currentUserService.getCurrentUser()));
    }

    @PatchMapping("/{id}/reject")
    public ApiResponse<LoanRequestResponse> reject(@PathVariable Long id) {
        return ApiResponse.ok("Đã từ chối yêu cầu",
                loanRequestService.reject(id, currentUserService.getCurrentUser()));
    }

    @PatchMapping("/{id}/cancel")
    public ApiResponse<LoanRequestResponse> cancel(@PathVariable Long id) {
        return ApiResponse.ok("Đã hủy yêu cầu",
                loanRequestService.cancel(id, currentUserService.getCurrentUser()));
    }

    @PatchMapping("/{id}/return")
    public ApiResponse<LoanRequestResponse> markReturned(@PathVariable Long id) {
        return ApiResponse.ok("Đã xác nhận trả đồ",
                loanRequestService.markReturned(id, currentUserService.getCurrentUser()));
    }
}
