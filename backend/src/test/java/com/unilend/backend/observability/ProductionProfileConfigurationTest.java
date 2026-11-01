package com.unilend.backend.observability;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest(properties = {
        "app.jwt.secret=dW5pbGVuZC10ZXN0LWp3dC1zZWNyZXQta2V5LWF0LWxlYXN0LTMyLWJ5dGVz",
        "DB_URL=jdbc:h2:mem:unilend-prod-profile;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "DB_USERNAME=sa",
        "DB_PASSWORD=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.locations=classpath:db/migration/h2"
})
@ActiveProfiles("prod")
class ProductionProfileConfigurationTest {

    @Autowired
    private Environment environment;

    @Test
    void productionProfileDisablesSqlOutputAndErrorDetails() {
        assertEquals(false, environment.getProperty("spring.jpa.show-sql", Boolean.class));
        assertFalse(environment.getProperty("spring.jpa.open-in-view", Boolean.class));
        assertEquals("never", environment.getProperty("server.error.include-message"));
        assertEquals("never", environment.getProperty("server.error.include-stacktrace"));
    }
}
