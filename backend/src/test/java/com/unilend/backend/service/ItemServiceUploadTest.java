package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.ItemImage;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemServiceUploadTest {
    @Mock ItemRepository items;
    @Mock ItemImageRepository images;
    @Mock CategoryRepository categories;
    @Mock LoanRequestRepository loans;
    @Mock CurrentUserService currentUser;
    @TempDir Path uploadDir;
    ItemService service;
    Item item;

    @BeforeEach
    void setUp() {
        service = new ItemService(items, images, categories, loans, currentUser, new ImageUploadValidator());
        ReflectionTestUtils.setField(service, "uploadDir", uploadDir.toString());
        User owner = User.builder().id(1L).fullName("Owner").build();
        item = Item.builder().id(10L).title("Book").owner(owner).build();
        when(items.findByIdForImageUpload(10L)).thenReturn(Optional.of(item));
        when(currentUser.getCurrentUser()).thenReturn(owner);
        TransactionSynchronizationManager.initSynchronization();
    }

    @AfterEach
    void tearDown() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void successfulCommitKeepsNormalizedFile() throws Exception {
        saveNormally();
        var response = service.uploadImages(10L, List.of(png()));
        complete(TransactionSynchronization.STATUS_COMMITTED);
        assertEquals(1, response.images().size());
        assertEquals(1, physicalFiles());
        verify(images).flush();
    }

    @Test
    void saveFailureCleansNewFiles() throws Exception {
        when(images.save(any(ItemImage.class))).thenThrow(new IllegalStateException("database failure"));
        assertThrows(IllegalStateException.class, () -> service.uploadImages(10L, List.of(png())));
        assertEquals(0, physicalFiles());
    }

    @Test
    void flushFailureCleansWholeBatch() throws Exception {
        saveNormally();
        doThrow(new IllegalStateException("flush failure")).when(images).flush();
        assertThrows(IllegalStateException.class, () -> service.uploadImages(10L, List.of(png(), png())));
        assertEquals(0, physicalFiles());
    }

    @Test
    void rollbackAfterMethodReturnsAlsoCleansFiles() throws Exception {
        saveNormally();
        service.uploadImages(10L, List.of(png(), png()));
        assertEquals(2, physicalFiles());
        complete(TransactionSynchronization.STATUS_ROLLED_BACK);
        assertEquals(0, physicalFiles());
    }

    @Test
    void validatesEntireBatchBeforeWriting() throws Exception {
        var fake = new MockMultipartFile("files", "fake.jpg", "image/jpeg", "fake image".getBytes());
        assertThrows(BusinessException.class, () -> service.uploadImages(10L, List.of(png(), fake)));
        assertEquals(0, physicalFiles());
        verify(images, never()).save(any());
    }

    @Test
    void rejectsBatchOverRemainingQuota() throws Exception {
        when(images.countByItemId(10L)).thenReturn(4L);
        assertThrows(BusinessException.class, () -> service.uploadImages(10L, List.of(png(), png())));
        assertEquals(0, physicalFiles());
    }

    @Test
    void rejectsMoreThanFiveFiles() throws Exception {
        assertThrows(BusinessException.class, () -> service.uploadImages(10L, Collections.nCopies(6, png())));
        assertEquals(0, physicalFiles());
    }

    @Test
    void rejectsNonOwner() throws Exception {
        when(currentUser.getCurrentUser()).thenReturn(User.builder().id(2L).build());
        assertThrows(BusinessException.class, () -> service.uploadImages(10L, List.of(png())));
        verify(images, never()).save(any());
    }

    @Test
    void storageFailureDoesNotDeleteUnrelatedFiles() throws Exception {
        Path blocker = uploadDir.resolve("items");
        Files.writeString(blocker, "existing file");
        assertThrows(BusinessException.class, () -> service.uploadImages(10L, List.of(png())));
        assertEquals("existing file", Files.readString(blocker));
        verify(images, never()).save(any());
    }

    @Test
    void rollbackPreservesFilesFromEarlierUploads() throws Exception {
        Files.createDirectories(uploadDir.resolve("items/10"));
        Path previous = uploadDir.resolve("items/10/previous.png");
        Files.writeString(previous, "previous upload");
        when(images.countByItemId(10L)).thenReturn(1L);
        saveNormally();
        service.uploadImages(10L, List.of(png()));
        complete(TransactionSynchronization.STATUS_ROLLED_BACK);
        assertEquals(1, physicalFiles());
        assertEquals("previous upload", Files.readString(previous));
    }

    @Test
    void rejectsEmptyBatch() {
        assertThrows(BusinessException.class, () -> service.uploadImages(10L, List.of()));
    }

    private void saveNormally() {
        when(images.save(any(ItemImage.class))).thenAnswer(invocation -> {
            ItemImage image = invocation.getArgument(0);
            image.setId((long) item.getImages().size() + 1);
            return image;
        });
    }

    private void complete(int status) {
        TransactionSynchronizationManager.getSynchronizations().forEach(sync -> sync.afterCompletion(status));
    }

    private long physicalFiles() throws Exception {
        try (var paths = Files.walk(uploadDir)) {
            return paths.filter(Files::isRegularFile).count();
        }
    }

    private MockMultipartFile png() throws Exception {
        try (var in = getClass().getResourceAsStream("/upload/valid.png")) {
            assertNotNull(in);
            return new MockMultipartFile("files", "photo.png", "image/png", in.readAllBytes());
        }
    }
}
