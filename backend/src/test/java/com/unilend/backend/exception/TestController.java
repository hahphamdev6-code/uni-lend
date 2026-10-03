package com.unilend.backend.exception;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/test/404")
    public String notFound() {
        throw new ResourceNotFoundException("Không tìm thấy vật phẩm");
    }

    @GetMapping("/test/500")
    public String error() {
        throw new RuntimeException("boom");
    }
}