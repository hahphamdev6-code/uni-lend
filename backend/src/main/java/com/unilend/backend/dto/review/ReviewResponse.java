package com.unilend.backend.dto.review;

import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.LoanRequest;
import com.unilend.backend.entity.Review;
import com.unilend.backend.entity.User;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        Long loanId,
        Long itemId,
        String itemTitle,
        Integer rating,
        String comment,
        UserSummary reviewer,
        UserSummary reviewee,
        Instant createdAt
) {

    public record UserSummary(Long id, String fullName) {
    }

    public static ReviewResponse from(Review review) {
        LoanRequest loan = review.getLoan();
        Item item = loan != null ? loan.getItem() : null;
        User reviewer = review.getReviewer();
        User reviewee = review.getReviewee();

        return new ReviewResponse(
                review.getId(),
                loan != null ? loan.getId() : null,
                item != null ? item.getId() : null,
                item != null ? item.getTitle() : null,
                review.getRating(),
                review.getComment(),
                reviewer != null ? new UserSummary(reviewer.getId(), reviewer.getFullName()) : null,
                reviewee != null ? new UserSummary(reviewee.getId(), reviewee.getFullName()) : null,
                review.getCreatedAt()
        );
    }
}
