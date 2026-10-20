package com.unilend.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email không được để trống")
<<<<<<< HEAD
        @Email(message = "Email không hợp lệ")
=======
        @Email(message = "Email không đúng định dạng")
>>>>>>> feature/fe-item-manage-pages
        String email,

        @NotBlank(message = "Mật khẩu không được để trống")
        String password
) {
<<<<<<< HEAD
}
=======
}
>>>>>>> feature/fe-item-manage-pages
