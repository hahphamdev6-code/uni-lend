package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import com.unilend.backend.common.exception.ResourceNotFoundException;
import com.unilend.backend.dto.category.CategoryRequest;
import com.unilend.backend.dto.category.CategoryResponse;
import com.unilend.backend.entity.Category;
import com.unilend.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll(Sort.by("name")).stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        return CategoryResponse.from(getOrThrow(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        String name = req.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Danh mục '%s' đã tồn tại".formatted(name));
        }
        Category category = Category.builder()
                .name(name)
                .description(req.description())
                .build();
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category category = getOrThrow(id);
        String name = req.name().trim();
        categoryRepository.findByNameIgnoreCase(name)
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> {
                    throw new BusinessException(ErrorCode.CONFLICT, "Danh mục '%s' đã tồn tại".formatted(name));
                });
        category.setName(name);
        category.setDescription(req.description());
        return CategoryResponse.from(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = getOrThrow(id);
        categoryRepository.delete(category);
        categoryRepository.flush();
    }

    @Transactional(readOnly = true)
    public Category getOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("danh mục", id));
    }
}
