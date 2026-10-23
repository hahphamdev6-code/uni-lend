package com.unilend.backend.config;

import com.unilend.backend.entity.Item;
import com.unilend.backend.repository.CategoryRepository;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@ActiveProfiles({"demo", "test"})
@SpringBootTest(properties = {
        "app.seed.enabled=true",
        "app.seed.admin-password=demo-integration-admin-password",
        "app.seed.user-password=demo-integration-user-password",
        "spring.datasource.url=jdbc:h2:mem:demo-seed-integration;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "app.mail.enabled=false"
})
class DemoSeedIntegrationTest {
    @Autowired DemoDataSeeder seeder;
    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired ItemRepository items;
    @Autowired PasswordEncoder passwords;

    @Test
    @Transactional
    void startupSeedsTheMigratedDatabaseAndRerunPreservesExistingRows() {
        assertEquals(2L, users.count());
        assertEquals(3L, categories.count());
        assertEquals(3L, items.count());
        var admin = users.findByEmail(DemoDataSeeder.ADMIN_EMAIL).orElseThrow();
        var owner = users.findByEmail(DemoDataSeeder.USER_EMAIL).orElseThrow();
        assertEquals(Set.of("ADMIN", "USER"), admin.getRoles());
        assertTrue(admin.isEmailVerified());
        assertTrue(passwords.matches("demo-integration-admin-password", admin.getPassword()));
        assertTrue(passwords.matches("demo-integration-user-password", owner.getPassword()));
        assertEquals(3L, items.countByOwnerId(owner.getId()));
        var item = items.findAll().get(0);
        item.setStatus(Item.ItemStatus.LENT_OUT);
        items.saveAndFlush(item);
        String originalHash = admin.getPassword();

        seeder.run(null);
        items.flush();
        assertEquals(2L, users.count());
        assertEquals(3L, categories.count());
        assertEquals(3L, items.count());
        assertEquals(originalHash, users.findById(admin.getId()).orElseThrow().getPassword());
        assertEquals(Item.ItemStatus.LENT_OUT, items.findById(item.getId()).orElseThrow().getStatus());
    }
}
