package com.unilend.backend.migration;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

/** Executes the H2 migration, not Hibernate-generated DDL. No MySQL or Docker needed. */
class DatabaseMigrationTest {
    private String url() {
        return "jdbc:h2:mem:migration_" + UUID.randomUUID().toString().replace("-", "")
                + ";MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1";
    }

    private Flyway flyway(String url) {
        return Flyway.configure().dataSource(url, "sa", "")
                .locations("classpath:db/migration/h2")
                .baselineOnMigrate(false).cleanDisabled(true).validateMigrationNaming(true).load();
    }

    @Test
    void createsAllTablesAndMigratesOnlyOnce() throws Exception {
        String url = url();
        Flyway flyway = flyway(url);
        assertEquals(2, flyway.migrate().migrationsExecuted);
        flyway.validate();
        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            for (String table : new String[]{"users", "user_roles", "categories", "items",
                    "item_images", "loan_requests", "notifications", "reviews", "account_tokens"}) {
                assertEquals(0, scalar(connection, "SELECT COUNT(*) FROM " + table));
            }
            assertEquals(14, scalar(connection, "SELECT COUNT(*) FROM information_schema.indexes "
                    + "WHERE index_name LIKE 'idx_%' AND table_schema = 'public'"));
            insertOwner(connection);
            connection.createStatement().executeUpdate("INSERT INTO user_roles(user_id, role) VALUES (1, 'USER')");
        }
        assertEquals(0, flyway.migrate().migrationsExecuted);
        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            assertEquals(1, scalar(connection, "SELECT COUNT(*) FROM users"));
            assertEquals(1, scalar(connection, "SELECT COUNT(*) FROM user_roles"));
        }
    }

    @Test
    void enforcesUniqueForeignKeyAndNotNullConstraints() throws Exception {
        String url = url();
        flyway(url).migrate();
        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            insertOwner(connection);
            assertThrows(SQLException.class, () -> connection.createStatement().executeUpdate(
                    "INSERT INTO users(id, created_at, email, password, full_name, enabled) "
                    + "VALUES (2, CURRENT_TIMESTAMP, 'owner@example.test', 'hash', 'Duplicate', TRUE)"));
            assertThrows(SQLException.class, () -> connection.createStatement().executeUpdate(
                    "INSERT INTO user_roles(user_id, role) VALUES (999, 'USER')"));
            assertThrows(SQLException.class, () -> connection.createStatement().executeUpdate(
                    "INSERT INTO categories(id, created_at, name) VALUES (1, CURRENT_TIMESTAMP, NULL)"));
            connection.createStatement().executeUpdate("INSERT INTO items(id, created_at, title, owner_id, status) "
                    + "VALUES (1, CURRENT_TIMESTAMP, 'Book', 1, 'AVAILABLE')");
            connection.createStatement().executeUpdate("INSERT INTO loan_requests(id, created_at, item_id, "
                    + "borrower_id, status, requested_at) VALUES (1, CURRENT_TIMESTAMP, 1, 1, 'OVERDUE', CURRENT_TIMESTAMP)");
            connection.createStatement().executeUpdate("INSERT INTO reviews(id, created_at, loan_id, reviewer_id, "
                    + "reviewee_id, rating) VALUES (1, CURRENT_TIMESTAMP, 1, 1, 1, 5)");
            assertThrows(SQLException.class, () -> connection.createStatement().executeUpdate(
                    "INSERT INTO reviews(id, created_at, loan_id, reviewer_id, reviewee_id, rating) "
                    + "VALUES (2, CURRENT_TIMESTAMP, 1, 1, 1, 4)"));
        }
    }

    @Test
    void refusesUnknownExistingSchemaWithoutModifyingItsData() throws Exception {
        String url = url();
        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            connection.createStatement().execute("CREATE TABLE legacy_record(id INTEGER PRIMARY KEY)");
            connection.createStatement().executeUpdate("INSERT INTO legacy_record VALUES (42)");
        }
        assertThrows(FlywayException.class, () -> flyway(url).migrate());
        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            assertEquals(42, scalar(connection, "SELECT id FROM legacy_record"));
        }
    }

    @Test
    void explicitBaselineKeepsExistingRowsAndSkipsV1() throws Exception {
        String url = url();
        // Create a real V1 schema as a stand-in for an already initialized dev database.
        Flyway.configure().dataSource(url, "sa", "")
                .locations("classpath:db/migration/h2").target("1").load().migrate();
        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            insertOwner(connection);
            // Test database only: simulate pre-Flyway ownership by removing only its history.
            connection.createStatement().execute("DROP TABLE \"flyway_schema_history\"");
        }
        Flyway adoption = Flyway.configure().dataSource(url, "sa", "")
                .locations("classpath:db/migration/h2").baselineVersion("1")
                .baselineOnMigrate(false).cleanDisabled(true).load();
        adoption.baseline();
        assertEquals(1, adoption.migrate().migrationsExecuted);
        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            assertEquals(0, scalar(connection, "SELECT token_version FROM users WHERE id = 1"));
            assertEquals(0, scalar(connection, "SELECT COUNT(*) FROM users WHERE email_verified = TRUE"));
            assertEquals(0, scalar(connection, "SELECT COUNT(*) FROM account_tokens"));
            connection.createStatement().executeUpdate("INSERT INTO account_tokens "
                    + "(id, created_at, user_id, type, token_hash, expires_at) "
                    + "VALUES (1, CURRENT_TIMESTAMP, 1, 'PASSWORD_RESET', 'hash-one', CURRENT_TIMESTAMP)");
            assertThrows(SQLException.class, () -> connection.createStatement().executeUpdate(
                    "INSERT INTO account_tokens (id, created_at, user_id, type, token_hash, expires_at) "
                    + "VALUES (2, CURRENT_TIMESTAMP, 1, 'PASSWORD_RESET', 'hash-one', CURRENT_TIMESTAMP)"));
            assertThrows(SQLException.class, () -> connection.createStatement().executeUpdate(
                    "INSERT INTO account_tokens (id, created_at, user_id, type, token_hash, expires_at) "
                    + "VALUES (3, CURRENT_TIMESTAMP, 999, 'PASSWORD_RESET', 'other-hash', CURRENT_TIMESTAMP)"));
            assertEquals(1, scalar(connection, "SELECT COUNT(*) FROM users"));
            assertEquals(1, scalar(connection, "SELECT COUNT(*) FROM \"flyway_schema_history\" "
                    + "WHERE \"type\" = 'BASELINE' AND \"version\" = '1'"));
        }
    }

    private void insertOwner(Connection connection) throws SQLException {
        connection.createStatement().executeUpdate("INSERT INTO users(id, created_at, email, password, "
                + "full_name, enabled) VALUES (1, CURRENT_TIMESTAMP, 'owner@example.test', 'hash', 'Owner', TRUE)");
    }

    private int scalar(Connection connection, String sql) throws SQLException {
        try (var statement = connection.createStatement(); var result = statement.executeQuery(sql)) {
            assertTrue(result.next());
            return result.getInt(1);
        }
    }
}
