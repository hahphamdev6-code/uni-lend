package com.unilend.backend.repository;

import com.unilend.backend.entity.LoanIncident;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoanIncidentRepository extends JpaRepository<LoanIncident, Long> {

    @EntityGraph(attributePaths = {"loanRequest", "reporter", "updates", "updates.actor"})
    List<LoanIncident> findByLoanRequestIdOrderByCreatedAtDesc(Long loanRequestId);

    @EntityGraph(attributePaths = {"loanRequest", "loanRequest.item", "loanRequest.item.owner",
            "loanRequest.borrower", "reporter", "updates", "updates.actor"})
    Optional<LoanIncident> findWithDetailsById(Long id);
}
