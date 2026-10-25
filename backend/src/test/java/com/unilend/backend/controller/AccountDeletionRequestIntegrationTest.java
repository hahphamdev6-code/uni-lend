package com.unilend.backend.controller;

import com.jayway.jsonpath.JsonPath;
import com.unilend.backend.entity.AccountDeletionRequest;
import com.unilend.backend.entity.AccountToken;
import com.unilend.backend.repository.AccountDeletionRequestRepository;
import com.unilend.backend.repository.AccountTokenRepository;
import com.unilend.backend.service.AccountTokenService;
import com.unilend.backend.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

import java.util.ArrayList;
import java.util.List;
import java.time.Instant;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringBootTest(properties = {
        "app.jwt.secret=dW5pbGVuZC10ZXN0LWp3dC1zZWNyZXQta2V5LWF0LWxlYXN0LTMyLWJ5dGVz",
        "spring.datasource.url=jdbc:h2:mem:deletion-http-integration;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.show-sql=false",
        "spring.flyway.locations=classpath:db/migration/h2"
})
class AccountDeletionRequestIntegrationTest {

    private static final String PATH = "/api/users/me/deletion-requests";

    @Autowired private WebApplicationContext context;
    @Autowired private AccountDeletionRequestRepository requestRepository;
    @Autowired private AccountTokenRepository tokenRepository;
    @Autowired private AccountTokenService tokenService;
    @MockitoBean private EmailService emailService;

    private MockMvc mvc;
    private int emailSequence;

    @BeforeEach
    void setUp() {
        mvc = webAppContextSetup(context).apply(springSecurity()).build();
        emailSequence = 0;
    }

    @Test
    void unauthenticatedRequestsAreRejected() throws Exception {
        mvc.perform(post(PATH).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"password123\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get(PATH + "/current")).andExpect(status().isUnauthorized());
        mvc.perform(post(PATH + "/1/confirm").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"anything\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post(PATH + "/1/cancel")).andExpect(status().isUnauthorized());
    }

    @Test
    void ownerScopeAndResponsesDoNotExposePasswordCodeOrHash() throws Exception {
        String ownerToken = registerToken("delete-owner");
        Created created = create(ownerToken);
        String hash = tokenService.hashToken(created.code());

        assertFalse(created.body().contains("password123"));
        assertFalse(created.body().contains(created.code()));
        assertFalse(created.body().contains(hash));
        assertEquals(hash, tokenRepository.findByTokenHashAndType(hash,
                AccountToken.TokenType.ACCOUNT_DELETION_CONFIRMATION).orElseThrow().getTokenHash());

        String otherToken = registerToken("delete-other");
        mvc.perform(get(PATH + "/current").header("Authorization", bearer(otherToken)))
                .andExpect(status().isNotFound());
        mvc.perform(post(PATH + "/" + created.id() + "/confirm")
                        .header("Authorization", bearer(otherToken)).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"" + created.code() + "\"}"))
                .andExpect(status().isNotFound());
        mvc.perform(post(PATH + "/" + created.id() + "/cancel")
                        .header("Authorization", bearer(otherToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void expiredUsedAndCancelledCodesCannotConfirm() throws Exception {
        String expiredOwner = registerToken("delete-expired");
        Created expired = create(expiredOwner);
        AccountToken expiredToken = token(expired.code());
        expiredToken.setExpiresAt(Instant.now().minusSeconds(1));
        tokenRepository.saveAndFlush(expiredToken);
        mvc.perform(post(PATH + "/" + expired.id() + "/confirm")
                        .header("Authorization", bearer(expiredOwner)).contentType(MediaType.APPLICATION_JSON)
                        .content(codeBody(expired.code())))
                .andExpect(status().isBadRequest());

        String usedOwner = registerToken("delete-used");
        Created used = create(usedOwner);
        String confirmedBody = mvc.perform(post(PATH + "/" + used.id() + "/confirm")
                        .header("Authorization", bearer(usedOwner)).contentType(MediaType.APPLICATION_JSON)
                        .content(codeBody(used.code())))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertFalse(confirmedBody.contains(used.code()));
        assertFalse(confirmedBody.contains(tokenService.hashToken(used.code())));
        assertFalse(confirmedBody.contains("password123"));
        mvc.perform(post(PATH + "/" + used.id() + "/confirm")
                        .header("Authorization", bearer(usedOwner)).contentType(MediaType.APPLICATION_JSON)
                        .content(codeBody(used.code())))
                .andExpect(status().isConflict());

        String cancelledOwner = registerToken("delete-cancelled");
        Created cancelled = create(cancelledOwner);
        String cancelledBody = mvc.perform(post(PATH + "/" + cancelled.id() + "/cancel")
                        .header("Authorization", bearer(cancelledOwner)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertFalse(cancelledBody.contains(cancelled.code()));
        assertFalse(cancelledBody.contains(tokenService.hashToken(cancelled.code())));
        mvc.perform(post(PATH + "/" + cancelled.id() + "/confirm")
                        .header("Authorization", bearer(cancelledOwner)).contentType(MediaType.APPLICATION_JSON)
                        .content(codeBody(cancelled.code())))
                .andExpect(status().isConflict());
    }

    @Test
    void failedConfirmationCounterIsCommittedDespiteHttpError() throws Exception {
        String owner = registerToken("delete-attempts");
        Created created = create(owner);
        for (int attempt = 1; attempt <= 5; attempt++) {
            mvc.perform(post(PATH + "/" + created.id() + "/confirm")
                            .header("Authorization", bearer(owner)).contentType(MediaType.APPLICATION_JSON)
                            .content(codeBody("wrong-code-" + attempt)))
                    .andExpect(status().isBadRequest());
            AccountDeletionRequest stored = requestRepository.findById(created.id()).orElseThrow();
            assertEquals(attempt, stored.getFailedConfirmationAttempts());
        }
        mvc.perform(post(PATH + "/" + created.id() + "/confirm")
                        .header("Authorization", bearer(owner)).contentType(MediaType.APPLICATION_JSON)
                        .content(codeBody("sixth-wrong-code")))
                .andExpect(status().isTooManyRequests());
        assertEquals(5, requestRepository.findById(created.id()).orElseThrow().getFailedConfirmationAttempts());
    }

    @Test
    void creationRateLimitsEmailSendingSeparatelyFromWrongCodeAttempts() throws Exception {
        String owner = registerToken("delete-email-limit");
        for (int send = 1; send <= 3; send++) {
            Created request = create(owner);
            mvc.perform(post(PATH + "/" + request.id() + "/cancel")
                            .header("Authorization", bearer(owner)))
                    .andExpect(status().isOk());
        }
        mvc.perform(post(PATH).header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"password123\"}"))
                .andExpect(status().isTooManyRequests());
        verify(emailService, times(3)).sendAccountDeletionConfirmationEmail(
                anyString(), anyString(), anyString());
    }

    @Test
    void concurrentCreationForSameAccountPersistsOnlyOneActiveRequest() throws Exception {
        String owner = registerToken("delete-race-create");
        List<Integer> statuses = race(
                () -> postCreate(owner), () -> postCreate(owner));

        assertEquals(1, statuses.stream().filter(status -> status == 201).count(), statuses.toString());
        assertEquals(1, statuses.stream().filter(status -> status == 409).count(), statuses.toString());
        String current = mvc.perform(get(PATH + "/current").header("Authorization", bearer(owner)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        long requestId = ((Number) JsonPath.read(current, "$.data.id")).longValue();
        long userId = requestRepository.findById(requestId).orElseThrow().getUser().getId();
        assertEquals(1, requestRepository.findAllByUser_Id(userId).stream()
                .filter(request -> request.getActiveUserId() != null).count());
    }

    @Test
    void simultaneousConfirmationsConsumeOneCodeOnlyOnce() throws Exception {
        String owner = registerToken("delete-race-confirm");
        Created created = create(owner);
        List<Integer> statuses = race(
                () -> postConfirm(owner, created), () -> postConfirm(owner, created));

        assertEquals(1, statuses.stream().filter(status -> status == 200).count(), statuses.toString());
        assertEquals(1, statuses.stream().filter(status -> status == 409).count(), statuses.toString());
        assertNotNull(token(created.code()).getUsedAt());
    }

    @Test
    void concurrentConfirmationAndCancellationNeverReviveCancelledRequest() throws Exception {
        String owner = registerToken("delete-race-cancel");
        Created created = create(owner);
        List<Integer> statuses = race(
                () -> postConfirm(owner, created),
                () -> mvc.perform(post(PATH + "/" + created.id() + "/cancel")
                                .header("Authorization", bearer(owner)))
                        .andReturn().getResponse().getStatus());

        assertTrue(statuses.stream().allMatch(status -> status == 200 || status == 409), statuses.toString());
        AccountDeletionRequest finalRequest = requestRepository.findById(created.id()).orElseThrow();
        assertTrue(finalRequest.getStatus() == AccountDeletionRequest.Status.CANCELLED
                        || finalRequest.getStatus() == AccountDeletionRequest.Status.CONFIRMED_WAITING_CLEARANCE,
                finalRequest.getStatus().toString());
        if (finalRequest.getStatus() == AccountDeletionRequest.Status.CANCELLED) {
            mvc.perform(post(PATH + "/" + created.id() + "/confirm")
                            .header("Authorization", bearer(owner)).contentType(MediaType.APPLICATION_JSON)
                            .content(codeBody(created.code())))
                    .andExpect(status().isConflict());
            assertEquals(AccountDeletionRequest.Status.CANCELLED,
                    requestRepository.findById(created.id()).orElseThrow().getStatus());
        }
    }

    private int postCreate(String token) throws Exception {
        return mvc.perform(post(PATH).header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"password123\"}"))
                .andReturn().getResponse().getStatus();
    }

    private int postConfirm(String token, Created request) throws Exception {
        return mvc.perform(post(PATH + "/" + request.id() + "/confirm")
                        .header("Authorization", bearer(token)).contentType(MediaType.APPLICATION_JSON)
                        .content(codeBody(request.code())))
                .andReturn().getResponse().getStatus();
    }

    private List<Integer> race(CheckedIntTask first, CheckedIntTask second) throws Exception {
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            Future<Integer> a = pool.submit(() -> { ready.countDown(); start.await(); return first.run(); });
            Future<Integer> b = pool.submit(() -> { ready.countDown(); start.await(); return second.run(); });
            assertTrue(ready.await(5, TimeUnit.SECONDS), "both requests should reach the starting gate");
            start.countDown();
            return new ArrayList<>(List.of(a.get(20, TimeUnit.SECONDS), b.get(20, TimeUnit.SECONDS)));
        } finally {
            pool.shutdownNow();
        }
    }

    private String registerToken(String name) throws Exception {
        String email = name + "-" + (++emailSequence) + "@example.test";
        String response = mvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email
                                + "\",\"password\":\"password123\",\"fullName\":\"Deletion Test\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.token");
    }

    private Created create(String ownerToken) throws Exception {
        String response = mvc.perform(post(PATH).header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"password123\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        var captor = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(emailService, atLeastOnce()).sendAccountDeletionConfirmationEmail(
                anyString(), anyString(), captor.capture());
        long id = ((Number) JsonPath.read(response, "$.data.id")).longValue();
        return new Created(id, captor.getValue(), response);
    }

    private AccountToken token(String rawCode) {
        return tokenRepository.findByTokenHashAndType(tokenService.hashToken(rawCode),
                AccountToken.TokenType.ACCOUNT_DELETION_CONFIRMATION).orElseThrow();
    }

    private String bearer(String token) { return "Bearer " + token; }
    private String codeBody(String code) { return "{\"code\":\"" + code + "\"}"; }

    @FunctionalInterface
    private interface CheckedIntTask { int run() throws Exception; }

    private record Created(long id, String code, String body) { }
}
