package com.unilend.backend.repository;

import com.unilend.backend.entity.Item;
import com.unilend.backend.entity.Item.ItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @EntityGraph(attributePaths = {"owner", "category"})
    Optional<Item> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"owner", "category"})
    Page<Item> findByStatus(ItemStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"owner", "category"})
    Page<Item> findByOwnerId(Long ownerId, Pageable pageable);

    @EntityGraph(attributePaths = {"owner", "category"})
    Page<Item> findByCategoryIdAndStatus(Long categoryId, ItemStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"owner", "category"})
    @Query("""
            SELECT i FROM Item i
            WHERE (:keyword IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:categoryId IS NULL OR i.category.id = :categoryId)
              AND (:status IS NULL OR i.status = :status)
            """)
    Page<Item> search(@Param("keyword") String keyword,
                      @Param("categoryId") Long categoryId,
                      @Param("status") ItemStatus status,
                      Pageable pageable);

    long countByOwnerId(Long ownerId);
}