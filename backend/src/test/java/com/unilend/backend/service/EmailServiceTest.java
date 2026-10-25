package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;

class EmailServiceTest {

    private final ObjectProvider<JavaMailSender> mailSenderProvider = mock();
    private final JavaMailSender mailSender = mock();
    private final EmailService emailService = new EmailService(mailSenderProvider);

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "mailEnabled", true);
        ReflectionTestUtils.setField(emailService, "fromAddress", "no-reply@example.test");
        ReflectionTestUtils.setField(emailService, "frontendUrl", "https://app.example.test");
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);
    }

    @Test
    void sendsVerificationEmailWithTokenOnlyInMessage() {
        emailService.sendVerificationEmail("user@example.test", "Test User", "raw-verification-token");

        var messageCaptor = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage message = messageCaptor.getValue();
        assertEquals("no-reply@example.test", message.getFrom());
        assertEquals("user@example.test", message.getTo()[0]);
        assertTrue(
                message.getText().contains("https://app.example.test/verify-email?token=raw-verification-token"));
    }

    @Test
    void reportsMailFailureWithoutExposingProviderException() {
        doThrow(new MailSendException("sensitive smtp detail"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> emailService.sendPasswordResetEmail(
                        "user@example.test", "Test User", "raw-reset-token"));

        assertEquals("Không thể gửi email lúc này", exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    void reportsMissingMailSenderWhenSmtpIsEnabled() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(null);

        assertThrows(BusinessException.class,
                () -> emailService.sendVerificationEmail(
                        "user@example.test", "Test User", "raw-token"));
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendsDeletionConfirmationCodeOnlyInTheEmailBody() {
        String code = "private-deletion-code";
        emailService.sendAccountDeletionConfirmationEmail("user@example.test", "Test User", code);

        var captor = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        assertTrue(captor.getValue().getText().contains(code));
        assertEquals("user@example.test", captor.getValue().getTo()[0]);
    }
}
