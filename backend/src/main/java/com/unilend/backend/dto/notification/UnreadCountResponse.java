package com.unilend.backend.dto.notification;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UnreadCountResponse(
        long unreadCount
) {
    @JsonProperty("count")
    public long count() {
        return unreadCount;
    }
}
