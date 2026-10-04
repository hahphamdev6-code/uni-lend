package com.unilend.backend.common.exception;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resource, Object id) {
        super(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy %s với id = %s".formatted(resource, id));
    }
}