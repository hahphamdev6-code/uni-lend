package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.common.response.PageResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.item.ItemRequest;
import com.unilend.backend.dto.item.ItemResponse;
import com.unilend.backend.entity.Category;
import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.Item.ItemStatus;
import com.unilend.backend.entity.ItemImage;
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.CategoryRepository;
import com.unilend.backend.repository.ItemImageRepository;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.LoanRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemService {

    private static final int MAX_PAGE_SIZE = 50;
    private static final int MAX_IMAGES_PER_ITEM = 5;
    private final ItemRepository itemRepository;
    private final ItemImageRepository itemImageRepository;
    private final CategoryRepository categoryRepository;
    private final LoanRequestRepository loanRequestRepository;
    private final CurrentUserService currentUserService;
    private final ImageUploadValidator imageUploadValidator;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public ItemResponse create(ItemRequest req) {
        User owner = currentUserService.getCurrentUser();
        Item item = Item.builder()
                .title(req.title().trim())
                .description(req.description())
                .owner(owner)
                .category(resolveCategory(req.categoryId()))
                .status(ItemStatus.AVAILABLE)
                .build();
        return ItemResponse.from(itemRepository.save(item));
    }

    @Transactional
    public ItemResponse update(Long id, ItemRequest req) {
        Item item = getWithDetailsOrThrow(id);
        assertOwner(item);

        item.setTitle(req.title().trim());
        item.setDescription(req.description());
        item.setCategory(resolveCategory(req.categoryId()));
        if (req.status() != null && req.status() != item.getStatus()) {
            if (req.status() == ItemStatus.LENT_OUT) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Không thể tự đặt trạng thái LENT_OUT, trạng thái này do luồng mượn/trả quản lý");
            }
            if (item.getStatus() == ItemStatus.LENT_OUT) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Món đồ đang được cho mượn, không thể đổi trạng thái");
            }
            item.setStatus(req.status());
        }
        return ItemResponse.from(item);
    }

    @Transactional
    public void delete(Long id) {
        Item item = getWithDetailsOrThrow(id);
        assertOwner(item);
        if (loanRequestRepository.findByItemId(id, PageRequest.of(0, 1)).hasContent()) {
            throw new BusinessException(ErrorCode.CONFLICT,
                    "Món đồ đã có yêu cầu mượn, không thể xoá. Hãy chuyển sang UNAVAILABLE");
        }
        List<String> imageUrls = item.getImages().stream().map(ItemImage::getImageUrl).toList();
        itemRepository.delete(item);
        imageUrls.forEach(this::deletePhysicalFileQuietly);
    }

    @Transactional
    public ItemResponse uploadImages(Long itemId, List<MultipartFile> files) {
        Item item = itemRepository.findByIdForImageUpload(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("món đồ", itemId));
        assertOwner(item);

        if (files == null || files.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Vui lòng chọn ít nhất 1 file ảnh");
        }
        long currentCount = itemImageRepository.countByItemId(itemId);
        if (files.size() > MAX_IMAGES_PER_ITEM || currentCount + files.size() > MAX_IMAGES_PER_ITEM) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Mỗi món đồ chỉ được tối đa %d ảnh (hiện có %d ảnh)".formatted(MAX_IMAGES_PER_ITEM, currentCount));
        }

        List<ImageUploadValidator.ValidatedImage> validated = files.stream()
                .map(imageUploadValidator::validate).toList();
        List<String> createdUrls = new ArrayList<>();
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            throw new IllegalStateException("Upload ảnh phải chạy trong giao dịch");
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) {
                    createdUrls.forEach(ItemService.this::deletePhysicalFileQuietly);
                }
            }
        });
        try {
            for (ImageUploadValidator.ValidatedImage image : validated) {
                String imageUrl = storeFile(itemId, image);
                createdUrls.add(imageUrl);
                ItemImage itemImage = ItemImage.builder().item(item).imageUrl(imageUrl).build();
                item.getImages().add(itemImageRepository.save(itemImage));
            }
            itemImageRepository.flush();
            return ItemResponse.from(item);
        } catch (RuntimeException ex) {
            createdUrls.forEach(this::deletePhysicalFileQuietly);
            throw ex;
        }
    }

    @Transactional
    public ItemResponse deleteImage(Long itemId, Long imageId) {
        Item item = getWithDetailsOrThrow(itemId);
        assertOwner(item);

        ItemImage image = itemImageRepository.findByIdAndItemId(imageId, itemId)
                .orElseThrow(() -> new ResourceNotFoundException("ảnh món đồ", imageId));

        String url = image.getImageUrl();
        item.getImages().remove(image);
        itemImageRepository.delete(image);
        deletePhysicalFileQuietly(url);

        return ItemResponse.from(item);
    }

    @Transactional(readOnly = true)
    public ItemResponse findById(Long id) {
        return ItemResponse.from(getWithDetailsOrThrow(id));
    }

    private boolean canViewHiddenItem(Item item) {
        try {
            User viewer = currentUserService.getCurrentUser();
            return item.getOwner().getId().equals(viewer.getId()) || currentUserService.isAdmin(viewer);
        } catch (BusinessException ex) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<ItemResponse> search(String keyword, Long categoryId, ItemStatus status,
                                             int page, int size) {
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        return PageResponse.from(
                itemRepository.search(kw, categoryId, status, pageable(page, size)),
                ItemResponse::from);
    }

    @Transactional(readOnly = true)
    public PageResponse<ItemResponse> findMine(int page, int size) {
        User me = currentUserService.getCurrentUser();
        return PageResponse.from(
                itemRepository.findByOwnerId(me.getId(), pageable(page, size)),
                ItemResponse::from);
    }

    private String storeFile(Long itemId, ImageUploadValidator.ValidatedImage image) {
        String filename = UUID.randomUUID() + image.extension();
        Path itemDir = Paths.get(uploadDir, "items", String.valueOf(itemId)).toAbsolutePath().normalize();
        Path target = itemDir.resolve(filename);
        try {
            Files.createDirectories(itemDir);
            Files.write(target, image.bytes(), java.nio.file.StandardOpenOption.CREATE_NEW);
            return "/uploads/items/" + itemId + "/" + filename;
        } catch (IOException e) {
            try {
                Files.deleteIfExists(target);
            } catch (IOException cleanupFailure) {
                e.addSuppressed(cleanupFailure);
            }
            log.error("Không thể lưu file ảnh cho item {}", itemId, e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không thể lưu file ảnh");
        }
    }

    private void deletePhysicalFileQuietly(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/uploads/")) {
            return;
        }
        String relativePath = imageUrl.substring("/uploads/".length());
        Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path filePath = root.resolve(relativePath).normalize();
        if (!filePath.startsWith(root)) {
            log.warn("Từ chối xoá file ngoài thư mục upload");
            return;
        }
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Không thể xoá file vật lý {}: {}", filePath, e.getMessage());
        }
    }

    private Pageable pageable(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
    }

    private Item getWithDetailsOrThrow(Long id) {
        return itemRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("món đồ", id));
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("danh mục", categoryId));
    }

    private void assertOwner(Item item) {
        User me = currentUserService.getCurrentUser();
        if (!item.getOwner().getId().equals(me.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Chỉ chủ đồ mới được thực hiện thao tác này");
        }
    }
}