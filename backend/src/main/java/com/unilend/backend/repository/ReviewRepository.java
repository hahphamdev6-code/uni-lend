package com.unilend.backend.repository;

import com.unilend.backend.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByLoanIdAndReviewerId(Long loanId, Long reviewerId);

    @Query("""
            SELECT r.loan.id FROM Review r
            WHERE r.reviewer.id = :reviewerId
              AND r.loan.id IN :loanIds
            """)
    Set<Long> findReviewedLoanIdsByReviewerIdAndLoanIds(@Param("reviewerId") Long reviewerId,
                                                        @Param("loanIds") Collection<Long> loanIds);

    @EntityGraph(attributePaths = {"reviewer", "reviewee", "loan", "loan.item"})
    Page<Review> findByRevieweeId(Long revieweeId, Pageable pageable);

    @EntityGraph(attributePaths = {"reviewer", "reviewee", "loan", "loan.item"})
    List<Review> findByLoanIdOrderByCreatedAtDesc(Long loanId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.reviewee.id = :userId")
    Double getAverageRatingByUserId(@Param("userId") Long userId);

    long countByRevieweeId(Long revieweeId);
}
