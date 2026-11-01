package com.unilend.backend.observability;

import com.unilend.backend.common.web.RequestIdFilter;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "app.jwt.secret=dW5pbGVuZC10ZXN0LWp3dC1zZWNyZXQta2V5LWF0LWxlYXN0LTMyLWJ5dGVz",
        "spring.datasource.url=jdbc:h2:mem:unilend-integration;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.show-sql=false"
})
@AutoConfigureMockMvc
class ObservabilityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void publicHealthAndProbeEndpointsExposeStatusWithoutInternalDetails() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components").doesNotExist());

        mockMvc.perform(get("/actuator/health/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components").doesNotExist());

        mockMvc.perform(get("/actuator/health/liveness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components").doesNotExist());
    }

    @Test
    void metricsRequireAdministratorRole() throws Exception {
        mockMvc.perform(get("/actuator/metrics"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void metricsForbiddenForUser() throws Exception {
        mockMvc.perform(get("/actuator/metrics"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void metricsAvailableForAdministrator() throws Exception {
        mockMvc.perform(get("/actuator/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.names").isArray());
    }

    @Test
    void requestIdIsReturnedAndInvalidInputIsReplaced() throws Exception {
        mockMvc.perform(get("/actuator/health").header(RequestIdFilter.HEADER_NAME, "client-trace-42"))
                .andExpect(status().isOk())
                .andExpect(header().string(RequestIdFilter.HEADER_NAME, "client-trace-42"));
        assertNull(MDC.get(RequestIdFilter.MDC_KEY));

        String generated = mockMvc.perform(get("/actuator/health")
                        .header(RequestIdFilter.HEADER_NAME, "x".repeat(65)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getHeader(RequestIdFilter.HEADER_NAME);
        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() -> UUID.fromString(generated));
        assertNull(MDC.get(RequestIdFilter.MDC_KEY));
    }
}
