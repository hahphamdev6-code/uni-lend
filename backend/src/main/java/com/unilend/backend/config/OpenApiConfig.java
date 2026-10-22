package com.unilend.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Uni-Lend API",
                version = "v1",
                description = "API for the Uni-Lend lending platform"),
        security = @SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
)
@SecurityScheme(
        name = OpenApiConfig.SECURITY_SCHEME_NAME,
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Nhập JWT access token (không cần tiền tố 'Bearer ')"
)
public class OpenApiConfig {

    public static final String SECURITY_SCHEME_NAME = "bearerAuth";
}
