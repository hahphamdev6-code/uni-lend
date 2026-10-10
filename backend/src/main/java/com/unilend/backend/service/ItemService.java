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
import com.unilend.backend.entity.User;
import com.unilend.backend.repository.CategoryRepository;
import com.unilend.backend.repository.ItemRepository;
import com.unilend.backend.repository.LoanRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ItemService {

    private static final int MAX_PAGE_SIZE = 50;

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final LoanRequestRepository loanRequestRepository;
    private final CurrentUserService currentUserService;

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
        itemRepository.delete(item);
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
