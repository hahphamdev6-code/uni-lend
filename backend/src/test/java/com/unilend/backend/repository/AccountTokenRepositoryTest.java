package com.unilend.backend.repository;

import com.unilend.backend.entity.AccountToken;
import com.unilend.backend.entity.AccountToken.TokenType;
import com.unilend.backend.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:account-token-repository;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class AccountTokenRepositoryTest {

    @Autowired
    private AccountTokenRepository accountTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void validTokenCanBeConsumedOnlyOnceAndExpiredTokenCannotBeConsumed() {
        User user = userRepository.saveAndFlush(User.builder()
                .email("account-token@example.test")
                .password("encoded-password")
                .fullName("Account Token")
                .build());
        Instant now = Instant.now();
        AccountToken validToken = accountTokenRepository.saveAndFlush(AccountToken.builder()
                .user(user)
                .type(TokenType.PASSWORD_RESET)
                .tokenHash("valid-token-hash")
                .expiresAt(now.plusSeconds(60))
                .build());
        AccountToken expiredToken = accountTokenRepository.saveAndFlush(AccountToken.builder()
                .user(user)
                .type(TokenType.EMAIL_VERIFICATION)
                .tokenHash("expired-token-hash")
                .expiresAt(now.minusSeconds(1))
                .build());

        assertEquals(1, accountTokenRepository.consumeValidToken(
                validToken.getTokenHash(), validToken.getType(), now));
        assertEquals(0, accountTokenRepository.consumeValidToken(
                validToken.getTokenHash(), validToken.getType(), now));
        assertEquals(0, accountTokenRepository.consumeValidToken(
                expiredToken.getTokenHash(), expiredToken.getType(), now));
        assertNotNull(accountTokenRepository.findByTokenHashAndType(
                validToken.getTokenHash(), validToken.getType()).orElseThrow().getUsedAt());
    }
}
