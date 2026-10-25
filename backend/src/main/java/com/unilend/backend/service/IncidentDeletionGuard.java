package com.unilend.backend.service;

/** Integration port for incident-module readiness. Unknown must never be treated as clear. */
public interface IncidentDeletionGuard {

    CheckResult checkForOpenIncidents(Long userId);

    enum CheckResult {
        CLEAR,
        OPEN,
        UNKNOWN
    }
}
