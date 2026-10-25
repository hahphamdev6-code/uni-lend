package com.unilend.backend.entity;

import com.unilend.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_actor_created", columnList = "actor_user_id, created_at"),
        @Index(name = "idx_audit_target_created", columnList = "target_type, target_id, created_at"),
        @Index(name = "idx_audit_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
public class AuditLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ToString.Include
    private Long id;

    @Column(name = "actor_user_id", nullable = false)
    @ToString.Include
    private Long actorUserId;

    @Column(nullable = false, length = 50)
    @ToString.Include
    private String action;

    @Column(name = "target_type", nullable = false, length = 50)
    @ToString.Include
    private String targetType;

    @Column(name = "target_id", nullable = false)
    @ToString.Include
    private Long targetId;

    @Column(length = 500)
    private String reason;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AuditLog other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
