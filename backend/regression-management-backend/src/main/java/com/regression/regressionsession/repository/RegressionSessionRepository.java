package com.regression.regressionsession.repository;

import com.regression.regressionsession.entity.RegressionSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RegressionSessionRepository extends JpaRepository<RegressionSession, UUID> {
    List<RegressionSession> findAllByOrderByCreatedAtDesc();
}
