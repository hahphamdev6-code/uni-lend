package com.unilend.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"security.jwt.issuer-uri=https://issuer.example.test",
		"security.jwt.jwk-set-uri=https://issuer.example.test/jwks",
		"security.jwt.audience=unilend-test",
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
