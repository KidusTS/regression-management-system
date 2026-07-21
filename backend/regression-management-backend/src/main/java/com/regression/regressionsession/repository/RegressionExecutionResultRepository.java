package com.regression.regressionsession.repository;

import com.regression.regressionsession.entity.RegressionExecutionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RegressionExecutionResultRepository extends JpaRepository<RegressionExecutionResult, UUID> {

    @Query("SELECT r FROM RegressionExecutionResult r " +
           "JOIN FETCH r.testVersion tv " +
           "JOIN FETCH tv.regressionTest " +
           "WHERE r.session.id = :sessionId")
    List<RegressionExecutionResult> findAllBySessionId(@Param("sessionId") UUID sessionId);

    @Query("SELECT r FROM RegressionExecutionResult r " +
           "JOIN FETCH r.testVersion tv " +
           "JOIN FETCH tv.regressionTest " +
           "WHERE r.id = :id")
    Optional<RegressionExecutionResult> findByIdWithDetails(@Param("id") UUID id);

    Optional<RegressionExecutionResult> findBySessionIdAndTestVersionId(UUID sessionId, UUID testVersionId);
}
