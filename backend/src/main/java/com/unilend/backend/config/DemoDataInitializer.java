package com.unilend.backend.config;

import com.unilend.backend.entity.Category;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.LoanIncident;
import com.unilend.backend.entity.LoanIncidentUpdate;
import com.unilend.backend.entity.LoanRequest;
import com.unilend.backend.entity.Notification;
import com.unilend.backend.entity.Review;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.CategoryRepository;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.LoanIncidentRepository;
import com.unilend.backend.repository.LoanRequestRepository;
import com.unilend.backend.repository.NotificationRepository;
import com.unilend.backend.repository.ReviewRepository;
import com.unilend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DemoDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final LoanRequestRepository loanRequestRepository;
    private final ReviewRepository reviewRepository;
    private final LoanIncidentRepository loanIncidentRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0 || categoryRepository.count() > 0 || itemRepository.count() > 0
                || loanRequestRepository.count() > 0 || reviewRepository.count() > 0
                || loanIncidentRepository.count() > 0) {
            return;
        }

        User admin = createUser(
                "Demo Admin",
                "admin@demo.unilend.local",
                "DemoAdmin123!",
                Set.of("USER", "ADMIN"),
                "Trường Demo",
                "0900000001"
        );

        User owner = createUser(
                "Demo Owner",
                "owner@demo.unilend.local",
                "DemoOwner123!",
                Set.of("USER"),
                "Đại học Demo",
                "0900000002"
        );

        User borrower = createUser(
                "Demo Borrower",
                "borrower@demo.unilend.local",
                "DemoBorrower123!",
                Set.of("USER"),
                "Học viện Demo",
                "0900000003"
        );

        User secondBorrower = createUser(
                "Demo Borrower 2",
                "borrower2@demo.unilend.local",
                "DemoBorrower456!",
                Set.of("USER"),
                "Đại học Kỹ thuật Demo",
                "0900000004"
        );

        Category laptopCategory = saveCategory("Laptop", "Thiết bị công nghệ cho học tập và làm việc");
        Category cameraCategory = saveCategory("Camera", "Thiết bị quay phim và chụp ảnh");
        Category studyCategory = saveCategory("Học tập", "Dụng cụ hỗ trợ học tập và nghiên cứu");

        Item laptopItem = saveItem(
                "MacBook Air 13 inch",
                "Laptop siêu mỏng, pin ấn tượng, phù hợp học tập và làm việc nhóm.",
                owner,
                laptopCategory,
                Item.ItemStatus.AVAILABLE
        );

        Item projectorItem = saveItem(
                "Máy chiếu mini",
                "Máy chiếu dễ mang theo, sáng rõ, rất phù hợp thuyết trình nhóm và học tập.",
                owner,
                studyCategory,
                Item.ItemStatus.AVAILABLE
        );

        Item cameraItem = saveItem(
                "Camera Sony ZV-1",
                "Dùng cho quay video, chụp sự kiện và bài tập thực hành.",
                owner,
                cameraCategory,
                Item.ItemStatus.AVAILABLE
        );

        Item speakerItem = saveItem(
                "Loa Bluetooth mini",
                "Loa nhỏ gọn, âm thanh rõ, hỗ trợ học nhóm và sự kiện ngoài trời.",
                borrower,
                studyCategory,
                Item.ItemStatus.AVAILABLE
        );

        LocalDate today = LocalDate.now();
        Instant now = Instant.now();

        LoanRequest pendingRequest = loanRequestRepository.save(LoanRequest.builder()
                .item(projectorItem)
                .borrower(borrower)
                .status(LoanRequest.LoanStatus.PENDING)
                .borrowFrom(today.plusDays(2))
                .dueDate(today.plusDays(8))
                .note("Mượn để thuyết trình cuối kỳ và làm video báo cáo nhóm.")
                .requestedAt(now.minusSeconds(3600))
                .build());

        LoanRequest approvedLoan = loanRequestRepository.save(LoanRequest.builder()
                .item(laptopItem)
                .borrower(borrower)
                .status(LoanRequest.LoanStatus.APPROVED)
                .borrowFrom(today.minusDays(12))
                .dueDate(today.plusDays(4))
                .note("Mượn để làm bài tập kỹ thuật số và làm việc từ xa trong 2 tuần.")
                .requestedAt(now.minusDays(15))
                .respondedAt(now.minusDays(14))
                .returnedAt(now.minusDays(1))
                .build());

        LoanRequest overdueLoan = loanRequestRepository.save(LoanRequest.builder()
                .item(cameraItem)
                .borrower(secondBorrower)
                .status(LoanRequest.LoanStatus.OVERDUE)
                .borrowFrom(today.minusDays(18))
                .dueDate(today.minusDays(4))
                .note("Mượn để quay video hội thảo khoa; đã quá hạn nhưng còn đang sử dụng.")
                .requestedAt(now.minusDays(25))
                .respondedAt(now.minusDays(24))
                .build());

        reviewRepository.saveAll(List.of(
                Review.builder()
                        .loan(approvedLoan)
                        .reviewer(borrower)
                        .reviewee(owner)
                        .rating(5)
                        .comment("Cho thuê rất chuyên nghiệp, máy mới và bảo quản cẩn thận.")
                        .build(),
                Review.builder()
                        .loan(approvedLoan)
                        .reviewer(owner)
                        .reviewee(borrower)
                        .rating(4)
                        .comment("Mượn đúng lịch, trả máy đầy đủ và liên lạc nhanh.")
                        .build()
        ));

        LoanIncident overdueIncident = LoanIncident.builder()
                .loanRequest(overdueLoan)
                .reporter(secondBorrower)
                .type(LoanIncident.IncidentType.LATE_RETURN)
                .description("Máy ảnh đã quá hạn 4 ngày do lịch quay sự kiện bị trễ và chưa kịp báo trước.")
                .status(LoanIncident.IncidentStatus.OPEN)
                .updates(new ArrayList<>())
                .build();

        LoanIncidentUpdate adminReviewUpdate = LoanIncidentUpdate.builder()
                .incident(overdueIncident)
                .actor(admin)
                .status(LoanIncident.IncidentStatus.IN_REVIEW)
                .message("Admin đã tiếp nhận báo cáo và đang xác minh lịch mượn thực tế cùng với người cho mượn.")
                .build();

        overdueIncident.getUpdates().add(adminReviewUpdate);
        overdueIncident = loanIncidentRepository.save(overdueIncident);

        LoanIncidentUpdate resolvedUpdate = LoanIncidentUpdate.builder()
                .incident(overdueIncident)
                .actor(admin)
                .status(LoanIncident.IncidentStatus.RESOLVED)
                .message("Đã xác nhận lịch trả trễ do sự kiện bất ngờ, đồng thời nhắc người mượn hoàn tất thủ tục trả sau 24h.")
                .build();
        overdueIncident.getUpdates().add(resolvedUpdate);
        overdueIncident.setStatus(LoanIncident.IncidentStatus.RESOLVED);
        loanIncidentRepository.save(overdueIncident);

        notificationRepository.saveAll(List.of(
                Notification.builder()
                        .user(owner)
                        .type(Notification.NotificationType.LOAN_CREATED.name())
                        .message("Có yêu cầu mượn mới cho máy chiếu mini từ Demo Borrower.")
                        .link("/loans/" + pendingRequest.getId())
                        .read(false)
                        .build(),
                Notification.builder()
                        .user(borrower)
                        .type(Notification.NotificationType.LOAN_APPROVED.name())
                        .message("Yêu cầu mượn MacBook Air của bạn đã được chấp thuận.")
                        .link("/loans/" + approvedLoan.getId())
                        .read(false)
                        .build(),
                Notification.builder()
                        .user(secondBorrower)
                        .type(Notification.NotificationType.LOAN_OVERDUE.name())
                        .message("Máy ảnh của bạn đã quá hạn trả. Vui lòng kiểm tra và xử lý kịp thời.")
                        .link("/loans/" + overdueLoan.getId())
                        .read(false)
                        .build(),
                Notification.builder()
                        .user(admin)
                        .type(Notification.NotificationType.SYSTEM.name())
                        .message("Báo cáo sự cố trả trễ đang chờ xử lý admin.")
                        .link("/admin")
                        .read(false)
                        .build(),
                Notification.builder()
                        .user(owner)
                        .type(Notification.NotificationType.REVIEW_RECEIVED.name())
                        .message("Bạn vừa nhận một đánh giá 5 sao từ Demo Borrower.")
                        .link("/profile")
                        .read(false)
                        .build()
        ));
    }

    private Category saveCategory(String name, String description) {
        return categoryRepository.save(Category.builder()
                .name(name)
                .description(description)
                .build());
    }

    private Item saveItem(String title, String description, User owner, Category category, Item.ItemStatus status) {
        return itemRepository.save(Item.builder()
                .title(title)
                .description(description)
                .owner(owner)
                .category(category)
                .status(status)
                .images(new ArrayList<>())
                .build());
    }

    private User createUser(String fullName, String email, String plainPassword, Set<String> roles,
                            String university, String phone) {
        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(plainPassword))
                .roles(new HashSet<>(roles))
                .university(university)
                .phone(phone)
                .enabled(true)
                .build();
        return userRepository.save(user);
    }
}
