package com.unilend.backend.scheduler;

import com.unilend.backend.entity.LoanRequest;
import com.unilend.backend.entity.LoanRequest.LoanStatus;
import com.unilend.backend.entity.Notification.NotificationType;
import com.unilend.backend.repository.LoanRequestRepository;
import com.unilend.backend.repository.NotificationRepository;
import com.unilend.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoanOverdueScheduler {

    private static final ZoneId ZONE =
            ZoneId.of("Asia/Ho_Chi_Minh");

    private final LoanRequestRepository loanRequestRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void updateOverdueLoans() {
        LocalDate today = LocalDate.now(ZONE);

        sendDueSoonReminders(today.plusDays(1));
        markOverdueLoans(today);
    }

    private void sendDueSoonReminders(LocalDate dueDate) {
        Page<LoanRequest> page;
        int pageNumber = 0;

        do {
            page = loanRequestRepository.findDueOn(
                    dueDate, PageRequest.of(pageNumber, 100));

            for (LoanRequest loan : page.getContent()) {
                notifyOnce(loan, NotificationType.LOAN_DUE_SOON,
                        "Khoan muon cua ban se den han vao ngay " + dueDate);
            }

            pageNumber++;
        } while (page.hasNext());
    }

    private void markOverdueLoans(LocalDate today) {
        while (true) {
            Page<LoanRequest> page = loanRequestRepository.findOverdue(
                    today, PageRequest.of(0, 100));

            if (page.isEmpty()) {
                break;
            }

            List<LoanRequest> loans = page.getContent();

            for (LoanRequest loan : loans) {
                loan.setStatus(LoanStatus.OVERDUE);
                notifyOnce(loan, NotificationType.LOAN_OVERDUE,
                        "Khoan muon cua ban da qua han tra.");
            }

            loanRequestRepository.saveAllAndFlush(loans);
            log.info("Updated {} loans to OVERDUE", loans.size());
        }
    }

    private void notifyOnce(
            LoanRequest loan,
            NotificationType type,
            String message
    ) {
        Long userId = loan.getBorrower().getId();
        String link = "/loans/" + loan.getId();

        LocalDate today = LocalDate.now(ZONE);
        Instant start = today.atStartOfDay(ZONE).toInstant();
        Instant end = today.plusDays(1).atStartOfDay(ZONE).toInstant();

        boolean exists =
                notificationRepository.existsByUserIdAndTypeAndLinkAndCreatedAtBetween(
                        userId, type.name(), link, start, end);

        if (!exists) {
            notificationService.notify(userId, type, message, link);
        }
    }
}
