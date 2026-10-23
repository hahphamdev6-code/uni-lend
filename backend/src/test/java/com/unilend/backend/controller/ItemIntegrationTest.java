package com.unilend.backend.controller;

import com.jayway.jsonpath.JsonPath;
import com.unilend.backend.entity.Category;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.CategoryRepository;
import com.unilend.backend.repository.UserRepository;
import com.unilend.backend.service.JwtService;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.context.WebApplicationContext;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/** Real security filter, services, repositories, Flyway and H2; no mocked application beans. */
@ActiveProfiles("test")
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:unilend-items-integration;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=validate",
        "app.seed.enabled=false",
        "app.mail.enabled=false"
})
class ItemIntegrationTest {
    private static final Path UPLOAD_ROOT = createUploadRoot();

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository users;
    @Autowired private CategoryRepository categories;
    @Autowired private JwtService jwtService;
    private MockMvc mvc;
    private String ownerToken;
    private String otherToken;

    @DynamicPropertySource
    static void uploadDirectory(DynamicPropertyRegistry registry) {
        registry.add("app.upload.dir", () -> UPLOAD_ROOT.toString());
    }

    @BeforeEach
    void setUp() {
        mvc = webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity()).build();
        ownerToken = createUserToken();
        otherToken = createUserToken();
    }

    @Test
    void ownerCanCreateReadUpdateAndDeleteItem() throws Exception {
        long id = createItem(ownerToken, "Original book");
        mvc.perform(get("/items/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Original book"))
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"));
        mvc.perform(put("/items/{id}", id).header("Authorization", ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Updated book","description":"Updated description","status":"UNAVAILABLE"}
                                """))
                .andExpect(status().isOk());
        mvc.perform(get("/items/{id}", id))
                .andExpect(jsonPath("$.data.title").value("Updated book"))
                .andExpect(jsonPath("$.data.description").value("Updated description"))
                .andExpect(jsonPath("$.data.status").value("UNAVAILABLE"));
        mvc.perform(delete("/items/{id}", id).header("Authorization", ownerToken))
                .andExpect(status().isOk());
        mvc.perform(get("/items/{id}", id)).andExpect(status().isNotFound());
    }

    @Test
    void otherUserCannotUpdateDeleteOrUploadToOwnersItem() throws Exception {
        long id = createItem(ownerToken, "Protected book");
        mvc.perform(put("/items/{id}", id).header("Authorization", otherToken)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Hijacked\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/items/{id}", id).header("Authorization", otherToken))
                .andExpect(status().isForbidden());
        mvc.perform(multipart("/items/{id}/images", id).file(validPng())
                        .header("Authorization", otherToken))
                .andExpect(status().isForbidden());
        mvc.perform(get("/items/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Protected book"))
                .andExpect(jsonPath("$.data.images.length()").value(0));
        assertEquals(0, fileCount(id));
    }

    @Test
    void anonymousUsersCannotWriteOrReadMine() throws Exception {
        long id = createItem(ownerToken, "Private ownership");
        mvc.perform(post("/items").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Anonymous\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(put("/items/{id}", id).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Anonymous\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(delete("/items/{id}", id)).andExpect(status().isUnauthorized());
        mvc.perform(get("/items/me")).andExpect(status().isUnauthorized());
        mvc.perform(multipart("/items/{id}/images", id).file(validPng()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidTitleAndMissingCategoryDoNotCreateItems() throws Exception {
        mvc.perform(post("/items").header("Authorization", ownerToken)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"   \"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/items").header("Authorization", ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Book\",\"categoryId\":9223372036854775807}"))
                .andExpect(status().isNotFound());
        mvc.perform(get("/items/me").header("Authorization", ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    void mineContainsOnlyAuthenticatedUsersItems() throws Exception {
        createItem(ownerToken, "My first item");
        createItem(ownerToken, "My second item");
        createItem(otherToken, "Other user item");
        mvc.perform(get("/items/me").header("Authorization", ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.content.length()").value(2));
        mvc.perform(get("/items/me").header("Authorization", otherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].title").value("Other user item"));
    }

    @Test
    void publicSearchSupportsCategoryStatusAndPagination() throws Exception {
        String keyword = "search" + UUID.randomUUID().toString().replace("-", "");
        Category category = categories.saveAndFlush(Category.builder()
                .name("Category " + UUID.randomUUID()).build());
        for (int index = 0; index < 2; index++) {
            mvc.perform(post("/items").header("Authorization", ownerToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"title\":\"%s %d\",\"categoryId\":%d}"
                                    .formatted(keyword, index, category.getId())))
                    .andExpect(status().isCreated());
        }
        createItem(otherToken, keyword + " different category");
        mvc.perform(get("/items").param("keyword", keyword)
                        .param("categoryId", category.getId().toString())
                        .param("status", "AVAILABLE").param("page", "1").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.totalPages").value(2))
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.content.length()").value(1));
        mvc.perform(get("/items").param("keyword", keyword).param("status", "UNAVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    void ownerCannotManuallyMarkItemLentOutAndFailedUpdateRollsBack() throws Exception {
        long id = createItem(ownerToken, "Original title");
        mvc.perform(put("/items/{id}", id).header("Authorization", ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Should roll back\",\"status\":\"LENT_OUT\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/items/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Original title"))
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"));
    }

    @Test
    void uploadPersistsImageAndOnlyOwnerCanDeleteIt() throws Exception {
        long id = createItem(ownerToken, "Item with image");
        MvcResult result = mvc.perform(multipart("/items/{id}/images", id).file(validPng())
                        .header("Authorization", ownerToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.images.length()").value(1)).andReturn();
        long imageId = number(result, "$.data.images[0].id");
        String url = JsonPath.read(result.getResponse().getContentAsString(), "$.data.imageUrls[0]");
        assertTrue(url.startsWith("/uploads/items/" + id + "/"));
        Path stored = UPLOAD_ROOT.resolve(url.substring("/uploads/".length())).normalize();
        assertTrue(stored.startsWith(UPLOAD_ROOT));
        assertTrue(Files.isRegularFile(stored));
        mvc.perform(delete("/items/{id}/images/{imageId}", id, imageId)
                        .header("Authorization", otherToken)).andExpect(status().isForbidden());
        assertTrue(Files.exists(stored));
        mvc.perform(get("/items/{id}", id))
                .andExpect(jsonPath("$.data.images.length()").value(1));
        mvc.perform(delete("/items/{id}/images/{imageId}", id, imageId)
                        .header("Authorization", ownerToken)).andExpect(status().isOk());
        assertFalse(Files.exists(stored));
        mvc.perform(get("/items/{id}", id))
                .andExpect(jsonPath("$.data.images.length()").value(0));
    }

    @Test
    void mixedBatchWithFakePngLeavesNoImagesOrFiles() throws Exception {
        long id = createItem(ownerToken, "Reject fake image");
        MockMultipartFile fake = new MockMultipartFile("files", "fake.png", "image/png",
                "This is not an image".getBytes(StandardCharsets.UTF_8));
        mvc.perform(multipart("/items/{id}/images", id).file(validPng()).file(fake)
                        .header("Authorization", ownerToken))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/items/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.images.length()").value(0));
        assertEquals(0, fileCount(id));
    }

    private String createUserToken() {
        User user = users.saveAndFlush(User.builder()
                .email("items-" + UUID.randomUUID() + "@example.test")
                .fullName("Item integration user")
                .password("unused-test-fixture-password")
                .enabled(true).emailVerified(true).build());
        // Authentication uses the real signed token and JwtAuthenticationFilter.
        // Login itself is covered separately by AuthAndLoanIntegrationTest.
        return "Bearer " + jwtService.generateToken(user.getId(), user.getEmail());
    }

    private long createItem(String token, String title) throws Exception {
        return number(mvc.perform(post("/items").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"" + title + "\"}"))
                .andExpect(status().isCreated()).andReturn(), "$.data.id");
    }

    private static long number(MvcResult result, String path) throws Exception {
        return ((Number) JsonPath.read(result.getResponse().getContentAsString(), path)).longValue();
    }

    private static MockMultipartFile validPng() throws IOException {
        try (var stream = ItemIntegrationTest.class.getResourceAsStream("/upload/valid.png")) {
            assertNotNull(stream, "Missing existing test fixture /upload/valid.png");
            return new MockMultipartFile("files", "valid.png", "image/png", stream.readAllBytes());
        }
    }

    private static long fileCount(long itemId) throws IOException {
        Path directory = UPLOAD_ROOT.resolve("items").resolve(Long.toString(itemId));
        if (!Files.exists(directory)) return 0;
        try (var paths = Files.walk(directory)) {
            return paths.filter(Files::isRegularFile).count();
        }
    }

    private static Path createUploadRoot() {
        try {
            return Files.createTempDirectory("unilend-items-it-").toAbsolutePath().normalize();
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create isolated test upload directory", e);
        }
    }

    @AfterAll
    static void removeTemporaryUploads() throws IOException {
        try (var paths = Files.walk(UPLOAD_ROOT)) {
            for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) {
                Files.deleteIfExists(path);
            }
        }
    }
}
