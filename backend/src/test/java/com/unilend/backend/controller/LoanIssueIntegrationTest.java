package com.unilend.backend.controller;

import com.jayway.jsonpath.JsonPath;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.NotificationRepository;
import com.unilend.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringBootTest(properties = {
        "app.jwt.secret=dW5pbGVuZC10ZXN0LWp3dC1zZWNyZXQta2V5LWF0LWxlYXN0LTMyLWJ5dGVz",
        "spring.datasource.url=jdbc:h2:mem:loan-issue-integration;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.show-sql=false"
})
class LoanIssueIntegrationTest {

    @Autowired
    private WebApplicationContext context;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationRepository notificationRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Test
    @DisplayName("End-to-end: Tạo sự cố, phân quyền truy cập, xử lý sự cố bởi ADMIN và chặn cập nhật khi đã đóng")
    void fullLoanIssueLifecycleAndPermissionVerification() throws Exception {
        String ownerToken = registerAndGetToken("issue-owner@example.test", "Owner Issue");
        String borrowerToken = registerAndGetToken("issue-borrower@example.test", "Borrower Issue");
        String strangerToken = registerAndGetToken("issue-stranger@example.test", "Stranger Issue");
        String adminToken = registerAndGetToken("issue-admin@example.test", "Admin Issue");

        // Gán quyền ADMIN cho admin user
        User adminUser = userRepository.findByEmail("issue-admin@example.test").orElseThrow();
        adminUser.getRoles().add("ADMIN");
        userRepository.save(adminUser);

        // 1. Owner tạo item
        String itemRes = mockMvc.perform(post("/items")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Máy chiếu Epson","description":"Máy chiếu hội thảo"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long itemId = ((Integer) JsonPath.read(itemRes, "$.data.id")).longValue();

        // 2. Borrower tạo yêu cầu mượn
        LocalDate tomorrow = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1);
        String loanRes = mockMvc.perform(post("/loans")
                        .header("Authorization", "Bearer " + borrowerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"itemId":%d,"borrowFrom":"%s","dueDate":"%s","note":"Mượn thuyết trình"}
                                """.formatted(itemId, tomorrow, tomorrow.plusDays(2))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long loanId = ((Integer) JsonPath.read(loanRes, "$.data.id")).longValue();

        // 3. Người lạ cố gắng tạo sự cố cho lượt mượn -> 403 FORBIDDEN
        mockMvc.perform(post("/api/loans/" + loanId + "/issues")
                        .header("Authorization", "Bearer " + strangerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"type":"DAMAGE","description":"Thử tạo trái phép"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));

        // 4. Borrower mở sự cố gắn với lượt mượn -> 201 CREATED
        String issueRes = mockMvc.perform(post("/api/loans/" + loanId + "/issues")
                        .header("Authorization", "Bearer " + borrowerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"type":"DAMAGE","description":"Bóng đèn máy chiếu bị chớp nháy liên tục"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.type").value("DAMAGE"))
                .andExpect(jsonPath("$.data.status").value("OPEN"))
                .andExpect(jsonPath("$.data.loanId").value(loanId))
                .andReturn().getResponse().getContentAsString();
        long issueId = ((Integer) JsonPath.read(issueRes, "$.data.id")).longValue();

        // Kiểm tra notification được gửi cho owner
        User ownerUser = userRepository.findByEmail("issue-owner@example.test").orElseThrow();
        var ownerNotifs = notificationRepository.findByUserId(ownerUser.getId(), org.springframework.data.domain.Pageable.unpaged());
        assertFalse(ownerNotifs.isEmpty());
        assertTrue(ownerNotifs.getContent().stream().anyMatch(n -> n.getType().equals("LOAN_ISSUE_CREATED")));

        // 5. Kiểm tra quyền xem sự cố:
        // Người lạ xem -> 403 FORBIDDEN
        mockMvc.perform(get("/api/loans/" + loanId + "/issues")
                        .header("Authorization", "Bearer " + strangerToken))
                .andExpect(status().isForbidden());

        // Borrower xem -> 200 OK
        mockMvc.perform(get("/api/loans/" + loanId + "/issues")
                        .header("Authorization", "Bearer " + borrowerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].id").value(issueId));

        // Owner xem -> 200 OK
        mockMvc.perform(get("/api/loans/" + loanId + "/issues")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].id").value(issueId));

        // 6. Borrower cố gắng xử lý (chuyển trạng thái) sự cố -> 403 FORBIDDEN
        mockMvc.perform(patch("/api/loan-issues/" + issueId + "/process")
                        .header("Authorization", "Bearer " + borrowerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"RESOLVED","decisionNote":"Tự duyệt xử lý"}
                                """))
                .andExpect(status().isForbidden());

        // 7. ADMIN xử lý sự cố chuyển sang RESOLVED -> 200 OK
        mockMvc.perform(patch("/api/loan-issues/" + issueId + "/process")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"RESOLVED","decisionNote":"Đã kiểm tra, thiết bị được bảo hành thay bóng đèn mới","version":0}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RESOLVED"))
                .andExpect(jsonPath("$.data.decisionNote").value("Đã kiểm tra, thiết bị được bảo hành thay bóng đèn mới"));

        // 8. Chặn cập nhật chồng lấn (optimistic concurrency):
        // Khi client truyền stale version (ví dụ version 0 sau khi đã tăng lên 1) -> 409 CONFLICT
        mockMvc.perform(patch("/api/loan-issues/" + issueId + "/process")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"CLOSED","decisionNote":"Đóng sự cố với stale version","version":0}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("CONFLICT"));

        // ADMIN đóng sự cố (RESOLVED -> CLOSED) với version đúng (version = 1) -> 200 OK
        mockMvc.perform(patch("/api/loan-issues/" + issueId + "/process")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"CLOSED","decisionNote":"Đã hoàn tất thay thế và nghiệm thu máy chiếu","version":1}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CLOSED"));

        // 9. Chặn thao tác trái trạng thái: từ CLOSED cố tình chuyển sang OPEN -> 409 CONFLICT
        mockMvc.perform(patch("/api/loan-issues/" + issueId + "/process")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"OPEN","decisionNote":"Mở lại sự cố đã đóng"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("CONFLICT"));

        // 10. Chặn sửa nội dung lịch sử sau khi đã đóng nếu không có quyền phù hợp:
        // Borrower cố tình sửa mô tả khi sự cố đã CLOSED -> 403 FORBIDDEN
        mockMvc.perform(patch("/api/loan-issues/" + issueId)
                        .header("Authorization", "Bearer " + borrowerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"Sửa nội dung sau khi đóng"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));

        // ADMIN có quyền sửa đổi nội dung sau khi đóng (ghi vết lịch sử) -> 200 OK
        mockMvc.perform(patch("/api/loan-issues/" + issueId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"Nội dung đã được đối soát và ghi chú bổ sung bởi admin"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.description").value("Nội dung đã được đối soát và ghi chú bổ sung bởi admin"));

        // Kiểm tra chi tiết sự cố hiển thị đủ lịch sử vết thao tác
        mockMvc.perform(get("/api/loan-issues/" + issueId)
                        .header("Authorization", "Bearer " + borrowerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.histories.length()").value(4)); // CREATED, STATUS_CHANGED (RESOLVED), STATUS_CHANGED (CLOSED), HISTORY_AMENDED
    }

    private String registerAndGetToken(String email, String fullName) throws Exception {
        String res = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"password123","fullName":"%s"}
                                """.formatted(email, fullName)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(res, "$.data.token");
    }
}
