package com.unilend.backend.service;

import com.unilend.backend.entity.AuditLog;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.AuditLogRepository;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(properties = {
        "app.jwt.secret=dW5pbGVuZC10ZXN0LWp3dC1zZWNyZXQta2V5LWF0LWxlYXN0LTMyLWJ5dGVz",
        "spring.datasource.url=jdbc:h2:mem:audit-transaction;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration/h2",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.show-sql=false"
})
class AuditTransactionTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private AdminModerationService moderationService;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private TransactionTemplate transactionTemplate;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void accountChangeAndAuditCommitTogether() {
        Long targetId = transactionTemplate.execute(status -> {
            User admin = userRepository.save(User.builder().email("audit-admin@example.test")
                    .password("hash").fullName("Admin").roles(Set.of("ADMIN")).build());
            User target = userRepository.save(User.builder().email("audit-target@example.test")
                    .password("hash").fullName("Target").build());
            authenticate(admin.getEmail());

            adminUserService.lockUser(target.getId(), "confirmed moderation");
            return target.getId();
        });

        User target = userRepository.findById(targetId).orElseThrow();
        assertFalse(target.isEnabled());
        AuditLog audit = auditLogRepository.findAll().stream()
                .filter(log -> log.getTargetId().equals(targetId))
                .findFirst().orElse(null);
        assertNotNull(audit);
        assertEquals("USER_LOCKED", audit.getAction());
    }

    @Test
    void auditFailureRollsBackAccountChange() {
        assertThrows(DataIntegrityViolationException.class, () -> transactionTemplate.executeWithoutResult(status -> {
            User admin = userRepository.save(User.builder().email("rollback-admin@example.test")
                    .password("hash").fullName("Admin").roles(Set.of("ADMIN")).build());
            User target = userRepository.save(User.builder().email("rollback-target@example.test")
                    .password("hash").fullName("Target").build());
            authenticate(admin.getEmail());

            adminUserService.lockUser(target.getId(), "x".repeat(501));
        }));

        assertTrue(userRepository.findByEmail("rollback-target@example.test").isEmpty());
        assertTrue(userRepository.findByEmail("rollback-admin@example.test").isEmpty());
    }

    @Test
    void moderationAuditFailureRollsBackItemChange() {
        Long itemId = transactionTemplate.execute(status -> {
            User admin = userRepository.save(User.builder().email("item-admin@example.test")
                    .password("hash").fullName("Admin").roles(Set.of("ADMIN")).build());
            User owner = userRepository.save(User.builder().email("item-owner@example.test")
                    .password("hash").fullName("Owner").build());
            Item item = itemRepository.save(Item.builder().title("Item").owner(owner).build());
            authenticate(admin.getEmail());
            return item.getId();
        });

        assertThrows(DataIntegrityViolationException.class, () -> transactionTemplate.executeWithoutResult(status -> {
            authenticate("item-admin@example.test");
            moderationService.hideItem(itemId, new com.unilend.backend.dto.admin.ModerationActionRequest(
                    "x".repeat(501)));
        }));

        Item unchanged = itemRepository.findById(itemId).orElseThrow();
        assertFalse(unchanged.isHiddenByAdmin());
        assertTrue(unchanged.getStatus() == Item.ItemStatus.AVAILABLE);
    }

    private void authenticate(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, Set.of()));
    }

    private void assertEquals(String expected, String actual) {
        org.junit.jupiter.api.Assertions.assertEquals(expected, actual);
    }
}
