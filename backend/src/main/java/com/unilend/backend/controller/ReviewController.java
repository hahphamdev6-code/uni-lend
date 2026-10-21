package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.review.ReviewRequest;
import com.unilend.backend.dto.review.ReviewResponse;
import com.unilend.backend.entity.User;
import com.unilend.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUserService currentUserService;

    @PostMapping({
            "/api/loans/{id}/reviews",
            "/loans/{id}/reviews",
            "/api/loan-requests/{id}/reviews",
            "/loan-requests/{id}/reviews"
    })
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request) {
        User currentUser = currentUserService.getCurrentUser();
        ReviewResponse body = reviewService.createReview(id, currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đánh giá thành công", body));
    }

    @GetMapping({
            "/api/loans/{id}/reviews",
            "/loans/{id}/reviews",
            "/api/loan-requests/{id}/reviews",
            "/loan-requests/{id}/reviews"
    })
    public ApiResponse<List<ReviewResponse>> getLoanReviews(@PathVariable Long id) {
        return ApiResponse.ok(reviewService.getReviewsByLoanId(id));
    }

    @GetMapping({
            "/api/users/{id}/reviews",
            "/users/{id}/reviews"
    })
    public ApiResponse<PageResponse<ReviewResponse>> getUserReviews(
            @PathVariable Long id,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.ok(reviewService.getReviewsByUserId(id, pageable));
    }
}
