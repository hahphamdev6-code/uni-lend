package com.unilend.backend.config;

import com.unilend.backend.entity.Category;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.CategoryRepository;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.core.env.MapPropertySource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class DemoDataSeederTest {
    private static final String ADMIN_PASSWORD = "demo-test-admin-password";
    private static final String USER_PASSWORD = "demo-test-user-password";
    private UserRepository users;
    private CategoryRepository categories;
    private ItemRepository items;
    private final Map<String, User> userRows = new HashMap<>();
    private final Map<String, Category> categoryRows = new HashMap<>();
    private final List<Item> itemRows = new ArrayList<>();
    private final PasswordEncoder encoder = new BCryptPasswordEncoder(4);
    private DemoDataSeeder seeder;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        categories = mock(CategoryRepository.class);
        items = mock(ItemRepository.class);
        when(users.findByEmail(anyString())).thenAnswer(call -> Optional.ofNullable(userRows.get(call.getArgument(0))));
        when(users.save(any(User.class))).thenAnswer(call -> {
            User user = call.getArgument(0);
            user.setId((long) userRows.size() + 1);
            userRows.put(user.getEmail(), user);
            return user;
        });
        when(categories.findByNameIgnoreCase(anyString())).thenAnswer(call ->
                Optional.ofNullable(categoryRows.get(((String) call.getArgument(0)).toLowerCase(Locale.ROOT))));
        when(categories.save(any(Category.class))).thenAnswer(call -> {
            Category category = call.getArgument(0);
            category.setId((long) categoryRows.size() + 1);
            categoryRows.put(category.getName().toLowerCase(Locale.ROOT), category);
            return category;
        });
        when(items.existsByOwnerIdAndTitleIgnoreCase(anyLong(), anyString())).thenAnswer(call ->
                itemRows.stream().anyMatch(item -> item.getOwner().getId().equals(call.getArgument(0))
                        && item.getTitle().equalsIgnoreCase(call.getArgument(1))));
        when(items.save(any(Item.class))).thenAnswer(call -> {
            Item item = call.getArgument(0);
            item.setId((long) itemRows.size() + 1);
            itemRows.add(item);
            return item;
        });
        seeder = new DemoDataSeeder(users, categories, items, encoder, ADMIN_PASSWORD, USER_PASSWORD);
    }

    @Test
    void createsFixturesWithHashedPasswordsAndExplicitDemoRoles() {
        seeder.run(null);
        assertEquals(2, userRows.size());
        assertEquals(3, categoryRows.size());
        assertEquals(3, itemRows.size());
        User admin = userRows.get(DemoDataSeeder.ADMIN_EMAIL);
        User owner = userRows.get(DemoDataSeeder.USER_EMAIL);
        assertEquals(Set.of("ADMIN", "USER"), admin.getRoles());
        assertEquals(Set.of("USER"), owner.getRoles());
        assertTrue(admin.isEmailVerified());
        assertTrue(owner.isEmailVerified());
        assertNotEquals(ADMIN_PASSWORD, admin.getPassword());
        assertTrue(encoder.matches(ADMIN_PASSWORD, admin.getPassword()));
        assertTrue(encoder.matches(USER_PASSWORD, owner.getPassword()));
        assertTrue(itemRows.stream().allMatch(item -> item.getOwner() == owner
                && item.getCategory() != null && item.getStatus() == Item.ItemStatus.AVAILABLE));
    }

    @Test
    void repeatedRunDoesNotDuplicateOrResetPasswordsAccountStateOrLoanedItems() {
        seeder.run(null);
        User admin = userRows.get(DemoDataSeeder.ADMIN_EMAIL);
        admin.setPassword("password-changed-by-user");
        admin.setEnabled(false);
        admin.setTokenVersion(8);
        Item existing = itemRows.get(0);
        existing.setStatus(Item.ItemStatus.LENT_OUT);
        existing.setDescription("edited by owner");
        seeder.run(null);
        assertEquals(2, userRows.size());
        assertEquals(3, categoryRows.size());
        assertEquals(3, itemRows.size());
        assertEquals("password-changed-by-user", admin.getPassword());
        assertFalse(admin.isEnabled());
        assertEquals(8, admin.getTokenVersion());
        assertEquals(Item.ItemStatus.LENT_OUT, existing.getStatus());
        assertEquals("edited by owner", existing.getDescription());
        verify(users, times(2)).save(any(User.class));
        verify(categories, times(3)).save(any(Category.class));
        verify(items, times(3)).save(any(Item.class));
    }

    @Test
    void missingOrShortCredentialsFailBeforeAnyRepositoryAccess() {
        for (String weak : new String[]{"", "short", "             "}) {
            var invalidAdmin = new DemoDataSeeder(users, categories, items, encoder, weak, USER_PASSWORD);
            assertThrows(IllegalStateException.class, () -> invalidAdmin.run(null));
            var invalidUser = new DemoDataSeeder(users, categories, items, encoder, ADMIN_PASSWORD, weak);
            assertThrows(IllegalStateException.class, () -> invalidUser.run(null));
        }
        verifyNoInteractions(users, categories, items);
    }

    @Test
    void collidingEmailDoesNotPromoteAnExistingUserToAdmin() {
        User existing = User.builder().id(42L).email(DemoDataSeeder.ADMIN_EMAIL)
                .fullName("Existing account").password("existing-hash").roles(Set.of("USER")).build();
        userRows.put(existing.getEmail(), existing);
        assertThrows(IllegalStateException.class, () -> seeder.run(null));
        assertEquals(Set.of("USER"), existing.getRoles());
        assertEquals("existing-hash", existing.getPassword());
        verify(users, never()).save(any(User.class));
        verifyNoInteractions(categories, items);
    }

    @Test
    void beanRequiresExplicitEnableFlagAndADevOrDemoProfile() {
        assertBean(false, false, "dev");
        assertBean(true, true, "dev");
        assertBean(true, true, "demo");
        assertBean(false, true, "test");
    }

    @Test
    void productionCannotCreateSeederEvenWithEnableFlagAndMixedProfiles() {
        assertBean(false, true, "prod");
        assertBean(false, true, "dev", "prod");
        assertBean(false, true, "demo", "prod");
    }

    private void assertBean(boolean expected, boolean enabled, String... profiles) {
        try (var context = new AnnotationConfigApplicationContext()) {
            context.getEnvironment().setActiveProfiles(profiles);
            context.getEnvironment().getPropertySources().addFirst(new MapPropertySource("seed-test", Map.of(
                    "app.seed.enabled", String.valueOf(enabled),
                    "app.seed.admin-password", ADMIN_PASSWORD,
                    "app.seed.user-password", USER_PASSWORD)));
            context.registerBean(UserRepository.class, () -> users);
            context.registerBean(CategoryRepository.class, () -> categories);
            context.registerBean(ItemRepository.class, () -> items);
            context.registerBean(PasswordEncoder.class, () -> encoder);
            context.register(DemoDataSeeder.class);
            context.refresh();
            assertEquals(expected ? 1 : 0, context.getBeansOfType(DemoDataSeeder.class).size());
        }
    }
}
