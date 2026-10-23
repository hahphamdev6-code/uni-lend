package com.unilend.backend;

import org.junit.jupiter.api.Test;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.context.SpringBootTest;

@ActiveProfiles("test")
@SpringBootTest(properties = {
		"app.jwt.secret=dW5pbGVuZC10ZXN0LWp3dC1zZWNyZXQta2V5LWF0LWxlYXN0LTMyLWJ5dGVz",
		"app.jwt.expiration-ms=86400000",
		"spring.datasource.url=jdbc:h2:mem:unilend-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password="
})
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
