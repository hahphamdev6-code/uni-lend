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

import java.time.LocalDate;
import java.util.Optional;

public interface LoanRequestRepository extends JpaRepository<LoanRequest, Long> {

    @EntityGraph(attributePaths = {"item", "item.owner", "borrower"})
    Optional<LoanRequest> findWithDetailsById(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"item", "item.owner", "borrower"})
    @Query("SELECT l FROM LoanRequest l WHERE l.id = :id")
    Optional<LoanRequest> findWithDetailsByIdForUpdate(@Param("id") Long id);

    @EntityGraph(attributePaths = {"item", "item.owner"})
    Page<LoanRequest> findByBorrowerId(Long borrowerId, Pageable pageable);

    @EntityGraph(attributePaths = {"item", "item.owner"})
    Page<LoanRequest> findByBorrowerIdAndStatus(Long borrowerId, LoanStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"item", "borrower"})
    Page<LoanRequest> findByItemOwnerId(Long ownerId, Pageable pageable);

    @EntityGraph(attributePaths = {"item", "borrower"})
    Page<LoanRequest> findByItemOwnerIdAndStatus(Long ownerId, LoanStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"borrower"})
    Page<LoanRequest> findByItemId(Long itemId, Pageable pageable);

    boolean existsByItemIdAndBorrowerIdAndStatus(Long itemId, Long borrowerId, LoanStatus status);

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

    @EntityGraph(attributePaths = {"item", "borrower"})
    @Query("""
            SELECT l FROM LoanRequest l
            WHERE l.status = com.unilend.backend.entity.LoanRequest.LoanStatus.APPROVED
              AND l.dueDate < :today
            """)
    Page<LoanRequest> findOverdue(@Param("today") LocalDate today, Pageable pageable);
}