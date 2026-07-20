package com.regression.regressiontest.repository;

import com.regression.regressiontest.entity.RegressionTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RegressionTestRepository extends JpaRepository<RegressionTest, UUID> {
    Optional<RegressionTest> findByRegressionPackIdAndTestIdRef(UUID packId, String testIdRef);
    List<RegressionTest> findAllByRegressionPackId(UUID packId);
}
