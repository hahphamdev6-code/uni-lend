package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:no-reply@unilend.local}")
    private String fromAddress;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendVerificationEmail(String toEmail, String fullName, String rawToken) {
        String verifyLink = frontendUrl + "/verify-email?token=" + rawToken;
        String subject = "[Uni-Lend] Xác minh địa chỉ email của bạn";
        String body = """
                Xin chào %s,
                
                Cảm ơn bạn đã đăng ký tài khoản Uni-Lend.
                Vui lòng truy cập đường dẫn dưới đây để xác minh email của bạn (có hiệu lực trong 24 giờ):
                %s
                
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
                """.formatted(fullName, verifyLink);

        sendEmail(toEmail, subject, body, "VERIFY_EMAIL");
    }

    public void sendPasswordResetEmail(String toEmail, String fullName, String rawToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
        String subject = "[Uni-Lend] Yêu cầu đặt lại mật khẩu";
        String body = """
                Xin chào %s,
                
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Uni-Lend của bạn.
                Vui lòng truy cập đường dẫn dưới đây để đặt lại mật khẩu (có hiệu lực trong 15 phút và chỉ dùng 1 lần):
                %s
                
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                """.formatted(fullName, resetLink);

        sendEmail(toEmail, subject, body, "RESET_PASSWORD");
    }

    public void sendAccountDeletionConfirmationEmail(String toEmail, String fullName, String rawToken) {
        String subject = "[Uni-Lend] Xác nhận yêu cầu đóng tài khoản";
        String body = """
                Xin chào %s,

                Nhập mã xác nhận dưới đây để xác nhận yêu cầu đóng tài khoản.
                Mã chỉ dùng một lần và có thời hạn ngắn.
                %s

                Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.
                """.formatted(fullName, rawToken);
        sendEmail(toEmail, subject, body, "ACCOUNT_DELETION_CONFIRMATION");
    }

    private void sendEmail(String toEmail, String subject, String text, String type) {
        if (!mailEnabled) {
            log.info("[MAIL-DISABLED] type={}", type);
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.error("[MAIL-ERROR] JavaMailSender is not configured. type={}", type);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Dịch vụ gửi email hiện không khả dụng");
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("[MAIL-SENT] type={}", type);
        } catch (MailException ex) {
            log.error("[MAIL-ERROR] Không thể gửi email type={}. causeType={}",
                    type, ex.getClass().getSimpleName());
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không thể gửi email lúc này");
        }
    }
}
