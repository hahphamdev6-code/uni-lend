package com.unilend.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringBootTest(properties = {
        "app.jwt.secret=dW5pbGVuZC10ZXN0LWp3dC1zZWNyZXQta2V5LWF0LWxlYXN0LTMyLWJ5dGVz",
        "spring.datasource.url=jdbc:h2:mem:unilend-integration;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.show-sql=false",
        "spring.flyway.locations=classpath:db/migration/h2"
})
class AuthAndLoanIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Test
    void registrationAndLoginReturnUsableBearerToken() throws Exception {
        String email = "integration-auth@example.test";
        String body = """
                {"email":"%s","password":"password123","fullName":"Integration User"}
                """.formatted(email);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"password123"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty());
    }

    @Test
    void loanHistoryRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/loans/mine"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    void authenticatedUserCanReadLoanHistory() throws Exception {
        String body = """
                {"email":"loan-history@example.test","password":"password123","fullName":"Loan User"}
                """;
        String token = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        token = com.jayway.jsonpath.JsonPath.read(token, "$.data.token");

        mockMvc.perform(get("/loans/mine")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    void openApiDocsIncludeBearerAuthSecurityScheme() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.type").value("http"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.bearerFormat").value("JWT"))
                .andExpect(jsonPath("$.security[0].bearerAuth").isArray());
    }

    @Test
    void concurrentApprovalsPreventOverlappingLoansAndAutoRejectOtherPending() throws Exception {
        String ownerToken = registerAndGetToken("owner-concurrent@example.test", "Owner Concurrent");
        String borrower1Token = registerAndGetToken("borrower1-concurrent@example.test", "Borrower One");
        String borrower2Token = registerAndGetToken("borrower2-concurrent@example.test", "Borrower Two");

        String itemJson = mockMvc.perform(post("/items")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Concurrent Camera","description":"DSLR"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Integer itemIdInt = com.jayway.jsonpath.JsonPath.read(itemJson, "$.data.id");
        long itemId = itemIdInt.longValue();

        java.time.LocalDate start = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1);
        java.time.LocalDate end = start.plusDays(3);

        String loan1Json = mockMvc.perform(post("/loans")
                        .header("Authorization", "Bearer " + borrower1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"itemId":%d,"borrowFrom":"%s","dueDate":"%s","note":"Request 1"}
                                """.formatted(itemId, start, end)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long loan1Id = ((Number) com.jayway.jsonpath.JsonPath.read(loan1Json, "$.data.id")).longValue();

        String loan2Json = mockMvc.perform(post("/loans")
                        .header("Authorization", "Bearer " + borrower2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"itemId":%d,"borrowFrom":"%s","dueDate":"%s","note":"Request 2"}
                                """.formatted(itemId, start.plusDays(1), end.plusDays(1))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long loan2Id = ((Number) com.jayway.jsonpath.JsonPath.read(loan2Json, "$.data.id")).longValue();

        java.util.concurrent.CountDownLatch ready = new java.util.concurrent.CountDownLatch(2);
        java.util.concurrent.CountDownLatch go = new java.util.concurrent.CountDownLatch(1);
        java.util.concurrent.ExecutorService pool = java.util.concurrent.Executors.newFixedThreadPool(2);

        java.util.concurrent.Callable<Integer> approve1 = () -> {
            ready.countDown();
            go.await();
            return mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/loans/" + loan1Id + "/approve")
                            .header("Authorization", "Bearer " + ownerToken))
                    .andReturn().getResponse().getStatus();
        };
        java.util.concurrent.Callable<Integer> approve2 = () -> {
            ready.countDown();
            go.await();
            return mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/loans/" + loan2Id + "/approve")
                            .header("Authorization", "Bearer " + ownerToken))
                    .andReturn().getResponse().getStatus();
        };

        java.util.concurrent.Future<Integer> f1 = pool.submit(approve1);
        java.util.concurrent.Future<Integer> f2 = pool.submit(approve2);
        ready.await();
        go.countDown();

        int s1 = f1.get();
        int s2 = f2.get();
        pool.shutdown();

        org.junit.jupiter.api.Assertions.assertTrue(
                (s1 == 200 && s2 == 409) || (s1 == 409 && s2 == 200),
                "Expected exactly one 200 OK and one 409 CONFLICT, got: " + s1 + " and " + s2);

        mockMvc.perform(get("/items/" + itemId + "/booked-dates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    private String registerAndGetToken(String email, String fullName) throws Exception {
        String res = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"password123","fullName":"%s"}
                                """.formatted(email, fullName)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return com.jayway.jsonpath.JsonPath.read(res, "$.data.token");
    }
}
