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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemService {

    private static final int MAX_PAGE_SIZE = 50;
    private static final int MAX_IMAGES_PER_ITEM = 5;
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024; // 5 MB

    private static final Map<String, String> ALLOWED_CONTENT_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/jpg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");

    private final ItemRepository itemRepository;
    private final ItemImageRepository itemImageRepository;
    private final CategoryRepository categoryRepository;
    private final LoanRequestRepository loanRequestRepository;
    private final CurrentUserService currentUserService;

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

        item.setTitle(req.title().trim())
                ;
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
        Item item = getWithDetailsOrThrow(itemId);
        assertOwner(item);

        if (files == null || files.isEmpty() || files.stream().allMatch(MultipartFile::isEmpty)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Vui lòng chọn ít nhất 1 file ảnh");
        }

        long currentCount = itemImageRepository.countByItemId(itemId);
        if (currentCount + files.size() > MAX_IMAGES_PER_ITEM) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Mỗi món đồ chỉ được tối đa %d ảnh (hiện có %d ảnh)".formatted(MAX_IMAGES_PER_ITEM, currentCount));
        }

        for (MultipartFile file : files) {
            validateImageFile(file);
        }

        for (MultipartFile file : files) {
            String imageUrl = storeFile(itemId, file);
            ItemImage itemImage = ItemImage.builder()
                    .item(item)
                    .imageUrl(imageUrl)
                    .build();
            item.getImages().add(itemImageRepository.save(itemImage));
        }

        return ItemResponse.from(item);
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

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "File ảnh không được rỗng");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Kích thước mỗi ảnh không được vượt quá 5MB");
        }
        String contentType = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_CONTENT_TYPES.containsKey(contentType)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Chỉ chấp nhận định dạng ảnh JPG, PNG hoặc WEBP");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase(Locale.ROOT);
            if (!ALLOWED_EXTENSIONS.contains(ext)) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Đuôi file không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png, .webp");
            }
        }
    }

    private String storeFile(Long itemId, MultipartFile file) {
        String contentType = file.getContentType().toLowerCase(Locale.ROOT);
        String ext = ALLOWED_CONTENT_TYPES.getOrDefault(contentType, ".jpg");
        String filename = UUID.randomUUID() + ext;

        Path itemDir = Paths.get(uploadDir, "items", String.valueOf(itemId)).toAbsolutePath().normalize();
        try {
            Files.createDirectories(itemDir);
            Path target = itemDir.resolve(filename).normalize();
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/uploads/items/" + itemId + "/" + filename;
        } catch (IOException e) {
            log.error("Không thể lưu file ảnh cho item {}", itemId, e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không thể lưu file ảnh");
        }
    }

    private void deletePhysicalFileQuietly(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/uploads/")) {
            return;
        }
        String relativePath = imageUrl.substring("/uploads/".length());
        Path filePath = Paths.get(uploadDir).resolve(relativePath).toAbsolutePath().normalize();
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