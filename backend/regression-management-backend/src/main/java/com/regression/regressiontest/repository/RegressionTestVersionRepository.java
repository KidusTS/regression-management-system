package com.regression.regressiontest.repository;

import com.regression.regressiontest.entity.RegressionTestVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RegressionTestVersionRepository extends JpaRepository<RegressionTestVersion, UUID> {
    Optional<RegressionTestVersion> findTopByRegressionTestIdOrderByVersionNumberDesc(UUID testId);
}
