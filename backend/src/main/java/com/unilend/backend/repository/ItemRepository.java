package com.unilend.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.unilend.backend.entity.Item;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    // Tìm kiếm các món đồ thuộc cùng một danh mục (Category)
    List<Item> findByCategoryId(Long categoryId);
    
    // Tìm kiếm đồ dùng theo tên gần đúng (Phục vụ tính năng Search trên Frontend)
    List<Item> findByNameContainingIgnoreCase(String name);
}
