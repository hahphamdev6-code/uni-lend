package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.dto.user.AccountDeletionRequestResponse;
import com.unilend.backend.dto.user.ConfirmAccountDeletionRequest;
import com.unilend.backend.dto.user.CreateAccountDeletionRequest;
import com.unilend.backend.service.AccountDeletionRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me/deletion-requests")
@RequiredArgsConstructor
public class AccountDeletionRequestController {

    private final AccountDeletionRequestService requestService;

    @PostMapping
    public ResponseEntity<ApiResponse<AccountDeletionRequestResponse>> create(
            @Valid @RequestBody CreateAccountDeletionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đã gửi mã xác nhận yêu cầu", requestService.create(request)));
    }

    @PostMapping("/{id}/confirm")
    public ApiResponse<AccountDeletionRequestResponse> confirm(
            @PathVariable Long id,
            @Valid @RequestBody ConfirmAccountDeletionRequest request) {
        return ApiResponse.ok("Đã xác nhận yêu cầu; chưa thực hiện xóa hoặc ẩn danh",
                requestService.confirm(id, request));
    }

    @GetMapping("/current")
    public ApiResponse<AccountDeletionRequestResponse> current() {
        return ApiResponse.ok(requestService.current());
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<AccountDeletionRequestResponse> cancel(@PathVariable Long id) {
        return ApiResponse.ok("Đã hủy yêu cầu", requestService.cancel(id));
    }
}
