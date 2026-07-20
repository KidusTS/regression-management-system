package com.regression.regressionsession.repository;

import com.regression.regressionsession.entity.RegressionExecutionResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RegressionExecutionResultRepository extends JpaRepository<RegressionExecutionResult, UUID> {
    List<RegressionExecutionResult> findAllBySessionId(UUID sessionId);
    Optional<RegressionExecutionResult> findBySessionIdAndTestVersionId(UUID sessionId, UUID testVersionId);
}
