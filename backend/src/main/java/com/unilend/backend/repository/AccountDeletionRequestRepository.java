package com.unilend.backend.repository;

import com.unilend.backend.entity.AccountDeletionRequest;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface AccountDeletionRequestRepository extends JpaRepository<AccountDeletionRequest, Long> {

    Optional<AccountDeletionRequest> findByActiveUserId(Long activeUserId);

    List<AccountDeletionRequest> findAllByUser_Id(Long userId);

    Optional<AccountDeletionRequest> findFirstByUser_IdOrderByRequestedAtDesc(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM AccountDeletionRequest r WHERE r.id = :id AND r.user.id = :userId")
    Optional<AccountDeletionRequest> findByIdAndUserIdForUpdate(
            @Param("id") Long id, @Param("userId") Long userId);
}
