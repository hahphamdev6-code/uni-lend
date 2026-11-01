package com.unilend.backend.common.web;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RequestIdFilterTest {

    private final RequestIdFilter filter = new RequestIdFilter();

    @AfterEach
    void clearMdc() {
        MDC.clear();
    }

    @Test
    void acceptsSafeRequestIdAndRemovesItFromMdcAfterRequest() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/health");
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addHeader(RequestIdFilter.HEADER_NAME, "trace-123.a_B");

        filter.doFilter(request, response, (req, res) ->
                assertEquals("trace-123.a_B", MDC.get(RequestIdFilter.MDC_KEY)));

        assertEquals("trace-123.a_B", response.getHeader(RequestIdFilter.HEADER_NAME));
        assertNull(MDC.get(RequestIdFilter.MDC_KEY));
    }

    @Test
    void replacesOverlongRequestIdWithGeneratedUuid() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/health");
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addHeader(RequestIdFilter.HEADER_NAME, "x".repeat(65));

        filter.doFilter(request, response, (req, res) -> {
            String requestId = MDC.get(RequestIdFilter.MDC_KEY);
            assertNotNull(requestId);
            assertDoesNotThrow(() -> UUID.fromString(requestId));
        });

        assertDoesNotThrow(() -> UUID.fromString(response.getHeader(RequestIdFilter.HEADER_NAME)));
        assertNull(MDC.get(RequestIdFilter.MDC_KEY));
    }

    @Test
    void removesRequestIdFromMdcWhenRequestProcessingThrows() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/health");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain failingChain = (req, res) -> { throw new IOException("test failure"); };

        assertThrows(IOException.class, () -> filter.doFilter(request, response, failingChain));
        assertNotNull(response.getHeader(RequestIdFilter.HEADER_NAME));
        assertNull(MDC.get(RequestIdFilter.MDC_KEY));
    }
}
