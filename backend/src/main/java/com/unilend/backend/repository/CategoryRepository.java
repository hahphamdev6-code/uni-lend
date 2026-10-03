package com.unilend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.unilend.backend.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Kiểm tra trùng tên danh mục khi tạo mới
    boolean existsByName(String name);
}
