package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.item.ItemRequest;
import com.unilend.backend.dto.item.ItemResponse;
import com.unilend.backend.dto.loan.BookedPeriodResponse;
import com.unilend.backend.dto.loan.LoanRequestResponse;
import com.unilend.backend.entity.Item.ItemStatus;
import com.unilend.backend.service.ItemService;
import com.unilend.backend.service.LoanRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping({"/api/items", "/items"})
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final LoanRequestService loanRequestService;
    private final CurrentUserService currentUserService;

    // Danh sách + tìm kiếm + phân trang (công khai)
    @GetMapping
    public ApiResponse<PageResponse<ItemResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(itemService.search(keyword, categoryId, status, page, size));
    }

    // Đồ của tôi (khai báo literal "/me" nên không bị nhầm với /{id})
    @GetMapping("/me")
    public ApiResponse<PageResponse<ItemResponse>> mine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(itemService.findMine(page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<ItemResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(itemService.findById(id));
    }

    // Lịch các khoảng ngày đã được duyệt của món đồ (công khai cho trang chi tiết đồ)
    @GetMapping("/{id}/booked-dates")
    public ApiResponse<List<BookedPeriodResponse>> getBookedDates(@PathVariable Long id) {
        return ApiResponse.ok(loanRequestService.getBookedPeriods(id));
    }

    // Danh sách chi tiết các lượt mượn đã duyệt theo thời gian (chỉ chủ đồ hoặc ADMIN)
    @GetMapping("/{id}/loans")
    public ApiResponse<List<LoanRequestResponse>> getItemApprovedLoans(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ApiResponse.ok(loanRequestService.getApprovedScheduleForItem(
                id, currentUserService.getCurrentUser(), fromDate, toDate));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ItemResponse>> create(@Valid @RequestBody ItemRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đăng món đồ thành công", itemService.create(req)));
    }

    @PutMapping("/{id}")
    public ApiResponse<ItemResponse> update(@PathVariable Long id,
                                            @Valid @RequestBody ItemRequest req) {
        return ApiResponse.ok("Cập nhật món đồ thành công", itemService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        itemService.delete(id);
        return ApiResponse.ok("Xoá món đồ thành công");
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ItemResponse>> uploadImages(
            @PathVariable Long id,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        List<MultipartFile> payload = new ArrayList<>();
        if (files != null) payload.addAll(files);
        if (images != null) payload.addAll(images);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tải ảnh lên thành công", itemService.uploadImages(id, payload)));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ApiResponse<ItemResponse> deleteImage(
            @PathVariable Long id,
            @PathVariable Long imageId) {
        return ApiResponse.ok("Xoá ảnh thành công", itemService.deleteImage(id, imageId));
    }
}
