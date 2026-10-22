package com.unilend.backend.repository;

import com.unilend.backend.entity.AccountToken;
import com.unilend.backend.entity.AccountToken.TokenType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface AccountTokenRepository extends JpaRepository<AccountToken, Long> {

    @EntityGraph(attributePaths = {"user"})
    Optional<AccountToken> findByTokenHashAndType(String tokenHash, TokenType type);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE AccountToken t
               SET t.usedAt = :now
             WHERE t.tokenHash = :tokenHash
               AND t.type = :type
               AND t.usedAt IS NULL
               AND t.expiresAt > :now
            """)
    int consumeValidToken(@Param("tokenHash") String tokenHash,
                          @Param("type") TokenType type,
                          @Param("now") Instant now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE AccountToken t
               SET t.usedAt = :now
             WHERE t.user.id = :userId
               AND t.type = :type
               AND t.usedAt IS NULL
            """)
    int invalidateUnusedTokens(@Param("userId") Long userId,
                               @Param("type") TokenType type,
                               @Param("now") Instant now);
}