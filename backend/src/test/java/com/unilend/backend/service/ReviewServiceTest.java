package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.dto.review.ReviewRequest;
import com.unilend.backend.dto.review.ReviewResponse;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.LoanRequest;
import com.unilend.backend.entity.LoanRequest.LoanStatus;
import com.unilend.backend.entity.Review;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.LoanRequestRepository;
import com.unilend.backend.repository.ReviewRepository;
import com.unilend.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private LoanRequestRepository loanRequestRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User owner;
    private User borrower;
    private User stranger;
    private Item item;
    private LoanRequest returnedLoan;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(1L).email("owner@unilend.test").fullName("Chủ đồ").build();
        borrower = User.builder().id(2L).email("borrower@unilend.test").fullName("Người mượn").build();
        stranger = User.builder().id(3L).email("stranger@unilend.test").fullName("Người lạ").build();
        item = Item.builder().id(10L).title("Máy tính Casio").owner(owner).build();
        returnedLoan = LoanRequest.builder()
                .id(100L)
                .item(item)
                .borrower(borrower)
                .status(LoanStatus.RETURNED)
                .build();
    }

    @Test
    void createReview_byBorrower_reviewsOwner() {
        when(loanRequestRepository.findWithDetailsByIdForUpdate(100L)).thenReturn(Optional.of(returnedLoan));
        when(reviewRepository.existsByLoanIdAndReviewerId(100L, 2L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(500L);
            return r;
        });

        ReviewResponse res = reviewService.createReview(100L, borrower, new ReviewRequest(5, "Đồ rất tốt!"));

        assertEquals(500L, res.id());
        assertEquals(100L, res.loanId());
        assertEquals(5, res.rating());
        assertEquals("Đồ rất tốt!", res.comment());
        assertEquals(2L, res.reviewer().id());
        assertEquals(1L, res.reviewee().id());
    }

    @Test
    void createReview_byOwner_reviewsBorrower() {
        when(loanRequestRepository.findWithDetailsByIdForUpdate(100L)).thenReturn(Optional.of(returnedLoan));
        when(reviewRepository.existsByLoanIdAndReviewerId(100L, 1L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(501L);
            return r;
        });

        ReviewResponse res = reviewService.createReview(100L, owner, new ReviewRequest(4, "Trả đúng hẹn"));

        assertEquals(501L, res.id());
        assertEquals(4, res.rating());
        assertEquals(1L, res.reviewer().id());
        assertEquals(2L, res.reviewee().id());
    }

    @Test
    void createReview_loanNotReturned_conflict() {
        returnedLoan.setStatus(LoanStatus.APPROVED);
        when(loanRequestRepository.findWithDetailsByIdForUpdate(100L)).thenReturn(Optional.of(returnedLoan));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> reviewService.createReview(100L, borrower, new ReviewRequest(5, "Ok")));
        assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
    }

    @Test
    void createReview_duplicateBySameSide_conflict() {
        when(loanRequestRepository.findWithDetailsByIdForUpdate(100L)).thenReturn(Optional.of(returnedLoan));
        when(reviewRepository.existsByLoanIdAndReviewerId(100L, 2L)).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> reviewService.createReview(100L, borrower, new ReviewRequest(5, "Đánh giá lần 2")));
        assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
    }

    @Test
    void createReview_byNonParticipant_forbidden() {
        when(loanRequestRepository.findWithDetailsByIdForUpdate(100L)).thenReturn(Optional.of(returnedLoan));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> reviewService.createReview(100L, stranger, new ReviewRequest(5, "Người lạ")));
        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }

    @Test
    void createReview_invalidRating_badRequest() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> reviewService.createReview(100L, borrower, new ReviewRequest(6, "Quá 5 sao")));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
    }

    @Test
    void getReviewsByUserId_returnsPagedReviews() {
        when(userRepository.existsById(1L)).thenReturn(true);
        Review review = Review.builder()
                .id(500L)
                .loan(returnedLoan)
                .reviewer(borrower)
                .reviewee(owner)
                .rating(5)
                .comment("Rất nhiệt tình")
                .build();
        when(reviewRepository.findByRevieweeId(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(review), PageRequest.of(0, 10), 1));

        PageResponse<ReviewResponse> page = reviewService.getReviewsByUserId(1L, PageRequest.of(0, 10));

        assertEquals(1, page.content().size());
        assertEquals(5, page.content().get(0).rating());
        assertEquals("Rất nhiệt tình", page.content().get(0).comment());
    }

    @Test
    void getReviewsByUserId_userNotFound_throwsResourceNotFound() {
        when(userRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> reviewService.getReviewsByUserId(999L, PageRequest.of(0, 10)));
    }

    @Test
    void getAverageRating_roundsToOneDecimal() {
        when(reviewRepository.getAverageRatingByUserId(1L)).thenReturn(4.6666667);

        assertEquals(4.7, reviewService.getAverageRating(1L));
    }
}
