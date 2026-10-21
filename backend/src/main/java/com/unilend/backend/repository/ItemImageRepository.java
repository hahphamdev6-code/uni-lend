package com.unilend.backend.repository;

import com.unilend.backend.entity.ItemImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemImageRepository extends JpaRepository<ItemImage, Long> {

    List<ItemImage> findByItemIdOrderByIdAsc(Long itemId);

    Optional<ItemImage> findByIdAndItemId(Long id, Long itemId);

    long countByItemId(Long itemId);
}
