package com.unilend.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Họ tên không được để trống")
        @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
        String fullName,

        @Pattern(regexp = "^(\\+84|0)[0-9]{8,10}$", message = "Số điện thoại không hợp lệ")
        String phone,

        @Size(max = 150, message = "Tên trường tối đa 150 ký tự")
        String university,

        @Size(max = 500, message = "Đường dẫn ảnh đại diện tối đa 500 ký tự")
        String avatarUrl
) {
}
