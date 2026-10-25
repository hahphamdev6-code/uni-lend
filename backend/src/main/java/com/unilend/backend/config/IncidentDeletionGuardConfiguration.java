package com.unilend.backend.config;

import com.unilend.backend.service.IncidentDeletionGuard;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IncidentDeletionGuardConfiguration {

    @Bean
    @ConditionalOnMissingBean(IncidentDeletionGuard.class)
    IncidentDeletionGuard unavailableIncidentDeletionGuard() {
        return userId -> IncidentDeletionGuard.CheckResult.UNKNOWN;
    }
}
