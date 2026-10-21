package com.unilend.backend.repository;

import com.unilend.backend.entity.LoanRequest;
import com.unilend.backend.entity.LoanRequest.LoanStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LoanRequestRepository extends JpaRepository<LoanRequest, Long> {

    @EntityGraph(attributePaths = {"item", "item.owner", "borrower"})
    Optional<LoanRequest> findWithDetailsById(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"item", "item.owner", "borrower"})
    @Query("SELECT l FROM LoanRequest l WHERE l.id = :id")
    Optional<LoanRequest> findWithDetailsByIdForUpdate(@Param("id") Long id);

    // Các yêu cầu mượn của một người mượn
    @EntityGraph(attributePaths = {"item", "item.owner"})
    Page<LoanRequest> findByBorrowerId(Long borrowerId, Pageable pageable);

    @EntityGraph(attributePaths = {"item", "item.owner"})
    Page<LoanRequest> findByBorrowerIdAndStatus(Long borrowerId, LoanStatus status, Pageable pageable);

    // Các yêu cầu gửi đến chủ đồ (owner)
    @EntityGraph(attributePaths = {"item", "borrower", "item.owner"})
    Page<LoanRequest> findByItemOwnerId(Long ownerId, Pageable pageable);

    @EntityGraph(attributePaths = {"item", "borrower", "item.owner"})
    Page<LoanRequest> findByItemOwnerIdAndStatus(Long ownerId, LoanStatus status, Pageable pageable);

    // Các yêu cầu của một món đồ
    @EntityGraph(attributePaths = {"borrower", "item.owner"})
    Page<LoanRequest> findByItemId(Long itemId, Pageable pageable);

    // Người dùng đã có yêu cầu PENDING cho món đồ này chưa (tránh gửi trùng)
    boolean existsByItemIdAndBorrowerIdAndStatus(Long itemId, Long borrowerId, LoanStatus status);

    // Kiểm tra trùng lịch với các yêu cầu đã được duyệt
    @Query("""
            SELECT COUNT(l) > 0 FROM LoanRequest l
            WHERE l.item.id = :itemId
              AND l.status = com.unilend.backend.entity.LoanRequest.LoanStatus.APPROVED
              AND l.borrowFrom <= :to
              AND l.dueDate >= :from
            """)
    boolean existsOverlappingApproved(@Param("itemId") Long itemId,
                                      @Param("from") LocalDate from,
                                      @Param("to") LocalDate to);

    // Các khoản mượn quá hạn
    @EntityGraph(attributePaths = {"item", "borrower", "item.owner"})
    @Query("""
            SELECT l FROM LoanRequest l
            WHERE l.status = com.unilend.backend.entity.LoanRequest.LoanStatus.APPROVED
              AND l.dueDate < :today
            """)
    Page<LoanRequest> findOverdue(@Param("today") LocalDate today, Pageable pageable);

    @EntityGraph(attributePaths = {"borrower", "item"})
    @Query("""
            SELECT l FROM LoanRequest l
            WHERE l.status = com.unilend.backend.entity.LoanRequest.LoanStatus.APPROVED
              AND l.dueDate = :dueDate
            """)
    Page<LoanRequest> findDueOn(
            @Param("dueDate") LocalDate dueDate,
            Pageable pageable
    );

    // Lọc lịch sử theo ngày gửi yêu cầu (requestedAt), giới hạn bởi người liên quan.
    @EntityGraph(attributePaths = {"item", "item.owner", "borrower"})
    @Query("""
            SELECT l FROM LoanRequest l
            WHERE l.borrower.id = :userId
              AND (:status IS NULL OR l.status = :status)
              AND (:fromInstant IS NULL OR l.requestedAt >= :fromInstant)
              AND (:toExclusive IS NULL OR l.requestedAt < :toExclusive)
            """)
    Page<LoanRequest> findBorrowerHistory(
            @Param("userId") Long userId,
            @Param("status") LoanStatus status,
            @Param("fromInstant") Instant fromInstant,
            @Param("toExclusive") Instant toExclusive,
            Pageable pageable);

    @EntityGraph(attributePaths = {"item", "item.owner", "borrower"})
    @Query("""
            SELECT l FROM LoanRequest l
            WHERE l.item.owner.id = :userId
              AND (:status IS NULL OR l.status = :status)
              AND (:fromInstant IS NULL OR l.requestedAt >= :fromInstant)
              AND (:toExclusive IS NULL OR l.requestedAt < :toExclusive)
            """)
    Page<LoanRequest> findOwnerHistory(
            @Param("userId") Long userId,
            @Param("status") LoanStatus status,
            @Param("fromInstant") Instant fromInstant,
            @Param("toExclusive") Instant toExclusive,
            Pageable pageable);

    @Query("""
            SELECT l.status, COUNT(l)
            FROM LoanRequest l
            GROUP BY l.status
            """)
    List<Object[]> countLoansByStatus();

    // Only loans that were actually approved count as borrowed.
    @Query("""
            SELECT c.id, c.name, COUNT(l)
            FROM LoanRequest l
            JOIN l.item i
            JOIN i.category c
            WHERE l.status NOT IN (
                com.unilend.backend.entity.LoanRequest.LoanStatus.PENDING,
                com.unilend.backend.entity.LoanRequest.LoanStatus.REJECTED,
                com.unilend.backend.entity.LoanRequest.LoanStatus.CANCELLED
            )
            GROUP BY c.id, c.name
            ORDER BY COUNT(l) DESC, c.name ASC
            """)
    List<Object[]> findMostBorrowedCategories(Pageable pageable);
}
