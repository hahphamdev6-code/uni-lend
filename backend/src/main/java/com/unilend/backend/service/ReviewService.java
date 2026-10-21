package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.dto.review.ReviewRequest;
import com.unilend.backend.dto.review.ReviewResponse;
import com.unilend.backend.entity.LoanRequest;
import com.unilend.backend.entity.LoanRequest.LoanStatus;
import com.unilend.backend.entity.Review;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.LoanRequestRepository;
import com.unilend.backend.repository.ReviewRepository;
import com.unilend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private static final int MAX_PAGE_SIZE = 50;

    private final ReviewRepository reviewRepository;
    private final LoanRequestRepository loanRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse createReview(Long loanId, User actor, ReviewRequest req) {
        if (req.rating() == null || req.rating() < 1 || req.rating() > 5) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Số sao đánh giá phải từ 1 đến 5");
        }

        LoanRequest loan = loanRequestRepository.findWithDetailsByIdForUpdate(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanRequest", loanId));

        User borrower = loan.getBorrower();
        User owner = loan.getItem().getOwner();

        boolean isBorrower = borrower.getId().equals(actor.getId());
        boolean isOwner = owner.getId().equals(actor.getId());

        if (!isBorrower && !isOwner) {
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "Chỉ người mượn hoặc chủ đồ của giao dịch này mới được đánh giá");
        }

        if (loan.getStatus() != LoanStatus.RETURNED) {
            throw new BusinessException(ErrorCode.CONFLICT,
                    "Chỉ có thể đánh giá khi khoản mượn đã ở trạng thái đã trả (RETURNED)");
        }

        if (reviewRepository.existsByLoanIdAndReviewerId(loanId, actor.getId())) {
            throw new BusinessException(ErrorCode.CONFLICT,
                    "Bạn đã đánh giá giao dịch mượn này rồi");
        }

        User reviewee = isBorrower ? owner : borrower;
        String comment = (req.comment() == null || req.comment().isBlank())
                ? null
                : req.comment().trim();

        Review review = Review.builder()
                .loan(loan)
                .reviewer(actor)
                .reviewee(reviewee)
                .rating(req.rating())
                .comment(comment)
                .build();

        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getReviewsByUserId(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }
        Pageable bounded = boundedPageable(pageable);
        Page<Review> page = reviewRepository.findByRevieweeId(userId, bounded);
        return PageResponse.from(page, ReviewResponse::from);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByLoanId(Long loanId) {
        if (!loanRequestRepository.existsById(loanId)) {
            throw new ResourceNotFoundException("LoanRequest", loanId);
        }
        return reviewRepository.findByLoanIdOrderByCreatedAtDesc(loanId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public double getAverageRating(Long userId) {
        Double avg = reviewRepository.getAverageRatingByUserId(userId);
        if (avg == null || avg == 0.0) {
            return 0.0;
        }
        return Math.round(avg * 10.0) / 10.0;
    }

    @Transactional(readOnly = true)
    public long getReviewCount(Long userId) {
        return reviewRepository.countByRevieweeId(userId);
    }

    private Pageable boundedPageable(Pageable pageable) {
        Sort defaultSort = Sort.by(Sort.Direction.DESC, "createdAt", "id");
        if (pageable == null || !pageable.isPaged()) {
            return PageRequest.of(0, 10, defaultSort);
        }
        int page = Math.max(pageable.getPageNumber(), 0);
        int size = Math.min(Math.max(pageable.getPageSize(), 1), MAX_PAGE_SIZE);
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : defaultSort;
        return PageRequest.of(page, size, sort);
    }
}
