package com.unilend.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.core.env.StandardEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

/** Loads real Boot config data without starting MySQL, SMTP or a web server. */
class ProfileConfigurationTest {
    private ApplicationContextRunner profile(String name) {
        return new ApplicationContextRunner()
                // Inspect shipped defaults independently of the developer's shell secrets.
                .withInitializer(context -> context.getEnvironment().getPropertySources()
                        .remove(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME))
                .withInitializer(new ConfigDataApplicationContextInitializer())
                .withPropertyValues("spring.profiles.active=" + name);
    }

    @Test
    void productionDisablesSqlOutputAndDoesNotImportLocalDotenv() {
        profile("prod").withPropertyValues("SHOW_SQL=true").run(context -> {
            var env = context.getEnvironment();
            assertThat(env.getProperty("spring.jpa.hibernate.ddl-auto")).isEqualTo("validate");
            assertThat(env.getProperty("spring.jpa.show-sql", Boolean.class)).isFalse();
            assertThat(env.getProperty("spring.jpa.properties.hibernate.format_sql", Boolean.class)).isFalse();
            assertThat(env.getProperty("spring.jpa.open-in-view", Boolean.class)).isFalse();
            assertThat(env.getProperty("spring.flyway.baseline-on-migrate", Boolean.class)).isFalse();
            assertThat(env.getProperty("spring.flyway.clean-disabled", Boolean.class)).isTrue();
            assertThat(env.getProperty("logging.level.org.hibernate.SQL")).isEqualTo("WARN");
            assertThat(env.getProperty("logging.level.org.hibernate.orm.jdbc.bind")).isEqualTo("OFF");
            assertThat(env.getProperty("spring.config.import")).isNull();
            assertThat(env.getProperty("spring.datasource.driver-class-name"))
                    .isEqualTo("com.mysql.cj.jdbc.Driver");
        });
    }

    @Test
    void productionReadsDeploymentValues() {
        profile("prod").withPropertyValues(
                "DB_URL=jdbc:mysql://db:3306/prod", "DB_USERNAME=deployment-user",
                "DB_PASSWORD=dummy-deployment-password", "JWT_SECRET=dummy-deployment-key",
                "JWT_ISSUER=https://api.example.test", "CORS_ALLOWED_ORIGINS=https://web.example.test",
                "FRONTEND_URL=https://web.example.test", "SMTP_HOST=smtp.example.test",
                "MAIL_FROM=no-reply@example.test").run(context -> {
            var env = context.getEnvironment();
            assertThat(env.getProperty("spring.datasource.url")).isEqualTo("jdbc:mysql://db:3306/prod");
            assertThat(env.getProperty("spring.datasource.username")).isEqualTo("deployment-user");
            assertThat(env.getProperty("spring.datasource.password")).isEqualTo("dummy-deployment-password");
            assertThat(env.getProperty("app.jwt.secret")).isEqualTo("dummy-deployment-key");
            assertThat(env.getProperty("app.mail.enabled", Boolean.class)).isTrue();
            assertThat(env.getProperty("spring.mail.host")).isEqualTo("smtp.example.test");
        });
    }

    @Test
    void testUsesH2AndDummySecretsWithoutLocalCredentialsOrEmailDelivery() {
        profile("test").withPropertyValues("DB_PASSWORD=irrelevant", "JWT_SECRET=irrelevant", "MAIL_ENABLED=true")
                .run(context -> {
                    var env = context.getEnvironment();
                    assertThat(env.getProperty("spring.datasource.url")).startsWith("jdbc:h2:mem:");
                    assertThat(env.getProperty("spring.datasource.username")).isEqualTo("sa");
                    assertThat(env.getProperty("spring.datasource.password")).isEmpty();
                    assertThat(env.getProperty("spring.flyway.locations")).isEqualTo("classpath:db/migration/h2");
                    assertThat(env.getProperty("spring.jpa.hibernate.ddl-auto")).isEqualTo("validate");
                    assertThat(env.getProperty("app.jwt.secret")).isNotEqualTo("irrelevant");
                    assertThat(env.getProperty("app.mail.enabled", Boolean.class)).isFalse();
                    assertThat(env.getProperty("spring.config.import")).isNull();
                });
    }

    @Test
    void devKeepsFlywayValidationAndAllowsExplicitSqlDebugging() {
        profile("dev").withPropertyValues("SHOW_SQL=true").run(context -> {
            var env = context.getEnvironment();
            assertThat(env.getProperty("spring.jpa.hibernate.ddl-auto")).isEqualTo("validate");
            assertThat(env.getProperty("spring.flyway.enabled", Boolean.class)).isTrue();
            assertThat(env.getProperty("spring.jpa.show-sql", Boolean.class)).isTrue();
            assertThat(env.getProperty("spring.config.import")).isEqualTo("optional:file:.env[.properties]");
        });
    }
}
