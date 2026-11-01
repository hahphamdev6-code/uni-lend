package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.dto.loan.IncidentCreateRequest;
import com.unilend.backend.dto.loan.IncidentStatusUpdateRequest;
import com.unilend.backend.dto.loan.LoanIncidentResponse;
import com.unilend.backend.entity.LoanIncident;
import com.unilend.backend.entity.LoanIncident.IncidentStatus;
import com.unilend.backend.entity.LoanIncidentUpdate;
import com.unilend.backend.entity.LoanRequest;
import com.unilend.backend.entity.LoanRequest.LoanStatus;
import com.unilend.backend.entity.Notification.NotificationType;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.LoanIncidentRepository;
import com.unilend.backend.repository.LoanRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanIncidentService {

    private final LoanIncidentRepository incidentRepository;
    private final LoanRequestRepository loanRequestRepository;
    private final NotificationService notificationService;

    @Transactional
    public LoanIncidentResponse create(Long loanId, User actor, IncidentCreateRequest request) {
        LoanRequest loan = loanRequestRepository.findWithDetailsById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanRequest", loanId));
        requireParticipant(loan, actor);
        if (loan.getStatus() != LoanStatus.APPROVED && loan.getStatus() != LoanStatus.OVERDUE) {
            throw new BusinessException(ErrorCode.CONFLICT,
                    "Chỉ có thể báo sự cố với lượt mượn đang được duyệt hoặc quá hạn");
        }

        LoanIncident incident = LoanIncident.builder()
                .loanRequest(loan)
                .reporter(actor)
                .type(request.type())
                .description(request.description().trim())
                .status(IncidentStatus.OPEN)
                .build();
        incident.getUpdates().add(LoanIncidentUpdate.builder()
                .incident(incident)
                .actor(actor)
                .status(IncidentStatus.OPEN)
                .message("Đã gửi báo cáo sự cố")
                .build());
        LoanIncident saved = incidentRepository.save(incident);

        Long borrowerId = loan.getBorrower().getId();
        Long ownerId = loan.getItem().getOwner().getId();
        String reportMessage = actor.getId().equals(borrowerId)
                ? "Bạn đã gửi báo cáo sự cố cho món đồ \"%s\"".formatted(loan.getItem().getTitle())
                : "%s đã báo sự cố cho món đồ \"%s\"".formatted(actor.getFullName(), loan.getItem().getTitle());
        notificationService.notify(borrowerId, NotificationType.INCIDENT_REPORTED,
                reportMessage, "/loans/" + loanId);
        if (!ownerId.equals(borrowerId)) {
            reportMessage = actor.getId().equals(ownerId)
                    ? "Bạn đã gửi báo cáo sự cố cho món đồ \"%s\"".formatted(loan.getItem().getTitle())
                    : "%s đã báo sự cố cho món đồ \"%s\"".formatted(actor.getFullName(), loan.getItem().getTitle());
            notificationService.notify(ownerId, NotificationType.INCIDENT_REPORTED,
                    reportMessage, "/loans/" + loanId);
        }
        return LoanIncidentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<LoanIncidentResponse> getForLoan(Long loanId, User actor) {
        LoanRequest loan = loanRequestRepository.findWithDetailsById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanRequest", loanId));
        requireParticipant(loan, actor);
        return incidentRepository.findByLoanRequestIdOrderByCreatedAtDesc(loanId)
                .stream().map(LoanIncidentResponse::from).toList();
    }

    @Transactional
    public LoanIncidentResponse updateStatus(
            Long incidentId, User actor, IncidentStatusUpdateRequest request) {
        if (actor.getRoles() == null || !actor.getRoles().contains("ADMIN")) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        LoanIncident incident = incidentRepository.findWithDetailsById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanIncident", incidentId));
        incident.setStatus(request.status());
        incident.getUpdates().add(LoanIncidentUpdate.builder()
                .incident(incident)
                .actor(actor)
                .status(request.status())
                .message(request.message().trim())
                .build());
        LoanRequest loan = incident.getLoanRequest();
        String statusLabel = switch (request.status()) {
            case OPEN -> "mới tiếp nhận";
            case IN_REVIEW -> "đang xử lý";
            case RESOLVED -> "đã giải quyết";
            case CLOSED -> "đã đóng";
        };
        String message = "Báo cáo sự cố cho món đồ \"%s\" đã được cập nhật: %s"
                .formatted(loan.getItem().getTitle(), statusLabel);
        notificationService.notify(loan.getBorrower().getId(), NotificationType.INCIDENT_UPDATED,
                message, "/loans/" + loan.getId());
        Long ownerId = loan.getItem().getOwner().getId();
        if (!ownerId.equals(loan.getBorrower().getId())) {
            notificationService.notify(ownerId, NotificationType.INCIDENT_UPDATED,
                    message, "/loans/" + loan.getId());
        }
        return LoanIncidentResponse.from(incident);
    }

    private void requireParticipant(LoanRequest loan, User actor) {
        boolean isBorrower = loan.getBorrower().getId().equals(actor.getId());
        boolean isOwner = loan.getItem().getOwner().getId().equals(actor.getId());
        boolean isAdmin = actor.getRoles() != null && actor.getRoles().contains("ADMIN");
        if (!isBorrower && !isOwner && !isAdmin) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }
}
