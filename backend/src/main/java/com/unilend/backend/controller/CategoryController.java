package com.unilend.backend.controller;

import com.unilend.backend.common.response.ApiResponse;
import com.unilend.backend.common.security.CurrentUserService;
import com.unilend.backend.dto.category.CategoryRequest;
import com.unilend.backend.dto.category.CategoryResponse;
import com.unilend.backend.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final CurrentUserService currentUserService;

    // Ai cũng xem được
    @GetMapping
    public ApiResponse<List<CategoryResponse>> list() {
        return ApiResponse.ok(categoryService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(categoryService.findById(id));
    }

    // Chỉ ADMIN
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> create(@Valid @RequestBody CategoryRequest req) {
        currentUserService.requireAdmin();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo danh mục thành công", categoryService.create(req)));
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody CategoryRequest req) {
        currentUserService.requireAdmin();
        return ApiResponse.ok("Cập nhật danh mục thành công", categoryService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        currentUserService.requireAdmin();
        categoryService.delete(id);
        return ApiResponse.ok("Xoá danh mục thành công");
    }
}
