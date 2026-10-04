package com.unilend.backend.common.entity;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter 
@Setter
public abstract class BaseEntity {
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}