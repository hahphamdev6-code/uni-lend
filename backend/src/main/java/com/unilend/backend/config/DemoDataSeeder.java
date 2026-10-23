package com.unilend.backend.config;

import com.unilend.backend.entity.Category;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.CategoryRepository;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

/** Explicitly enabled fixtures for an isolated development/demo database. */
@Component
@Profile("(dev | demo) & !prod")
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {
    public static final String ADMIN_EMAIL = "admin.demo@unilend.test";
    public static final String USER_EMAIL = "student.demo@unilend.test";
    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UserRepository users;
    private final CategoryRepository categories;
    private final ItemRepository items;
    private final PasswordEncoder passwords;
    private final String adminPassword;
    private final String userPassword;

    public DemoDataSeeder(UserRepository users, CategoryRepository categories,
                          ItemRepository items, PasswordEncoder passwords,
                          @Value("${app.seed.admin-password:}") String adminPassword,
                          @Value("${app.seed.user-password:}") String userPassword) {
        this.users = users;
        this.categories = categories;
        this.items = items;
        this.passwords = passwords;
        this.adminPassword = adminPassword;
        this.userPassword = userPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        requirePassword(adminPassword, "SEED_ADMIN_PASSWORD");
        requirePassword(userPassword, "SEED_USER_PASSWORD");

        user(ADMIN_EMAIL, "Quản trị viên Demo", Set.of("ADMIN", "USER"), adminPassword);
        User owner = user(USER_EMAIL, "Sinh viên Demo", Set.of("USER"), userPassword);
        Category books = category("Sách giáo trình (Demo)");
        Category study = category("Đồ học tập (Demo)");
        Category electronics = category("Đồ điện tử (Demo)");

        item(owner, books, "[DEMO] Giáo trình Java cơ bản", "Giáo trình lập trình Java dành cho sinh viên.");
        item(owner, study, "[DEMO] Máy tính cầm tay", "Máy tính cầm tay phục vụ học tập.");
        item(owner, electronics, "[DEMO] Đèn bàn học", "Đèn bàn nhỏ dùng trong góc học tập.");
        log.info("Development/demo fixture initialization completed; existing records were preserved.");
    }

    private void requirePassword(String value, String variable) {
        if (value == null || value.isBlank() || value.length() < 12) {
            throw new IllegalStateException(variable + " must contain at least 12 characters when demo seed is enabled");
        }
    }

    private User user(String email, String fullName, Set<String> roles, String rawPassword) {
        return users.findByEmail(email).map(existing -> {
            if (!existing.getRoles().containsAll(roles)) {
                // Do not promote an existing account just because it has a fixture email.
                throw new IllegalStateException("A demo email is already used by an account with different roles");
            }
            return existing;
        }).orElseGet(() -> users.save(User.builder()
                .email(email).fullName(fullName).password(passwords.encode(rawPassword))
                .roles(new HashSet<>(roles)).enabled(true).emailVerified(true).tokenVersion(0).build()));
    }

    private Category category(String name) {
        return categories.findByNameIgnoreCase(name).orElseGet(() -> categories.save(Category.builder()
                .name(name).description("Danh mục mẫu phục vụ trình diễn UniLend.").build()));
    }

    private void item(User owner, Category category, String title, String description) {
        if (!items.existsByOwnerIdAndTitleIgnoreCase(owner.getId(), title)) {
            items.save(Item.builder().owner(owner).category(category).title(title)
                    .description(description).status(Item.ItemStatus.AVAILABLE).build());
        }
    }
}
