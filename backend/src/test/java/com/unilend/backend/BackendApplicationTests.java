package com.unilend.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"app.jwt.secret=dW5pbGVuZC10ZXN0LWp3dC1zZWNyZXQta2V5LWF0LWxlYXN0LTMyLWJ5dGVz",
		"app.jwt.expiration-ms=86400000",
		"spring.datasource.url=jdbc:h2:mem:unilend-test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.flyway.locations=classpath:db/migration/h2",
		"spring.jpa.hibernate.ddl-auto=validate"
})
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
