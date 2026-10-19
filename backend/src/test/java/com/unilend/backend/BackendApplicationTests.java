package com.unilend.backend;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;

import java.time.Instant;
import java.util.List;

@SpringBootTest(properties = {
		"app.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
		"app.jwt.issuer=https://unilend.test",
		"app.jwt.expiration-ms=3600000",
		"spring.datasource.url=jdbc:h2:mem:unilend-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password="
})
class BackendApplicationTests {

	@Autowired
	private JwtEncoder jwtEncoder;

	@Autowired
	private JwtDecoder jwtDecoder;

	@Test
	void contextLoads() {
	}

	@Test
	void internalJwtCanBeIssuedAndValidated() {
		Instant now = Instant.now();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer("https://unilend.test")
				.subject("user@unilend.test")
				.issuedAt(now)
				.expiresAt(now.plusSeconds(60))
				.build();

		String token = jwtEncoder.encode(JwtEncoderParameters.from(
				JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
		var decoded = jwtDecoder.decode(token);

		Assertions.assertEquals("user@unilend.test", decoded.getSubject());
		Assertions.assertEquals("https://unilend.test", decoded.getIssuer().toString());
	}
}
