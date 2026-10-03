package com.unilend.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.unilend.backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Hàm tìm kiếm người dùng bằng Username (Rất quan trọng cho phần Đăng nhập/Auth sau này)
    Optional<User> findByUsername(String username);
    
    // Kiểm tra xem email hoặc username đã tồn tại khi đăng ký chưa
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
