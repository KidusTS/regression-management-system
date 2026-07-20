package com.regression.regressionpack.repository;

import com.regression.regressionpack.entity.RegressionPackVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RegressionPackVersionRepository extends JpaRepository<RegressionPackVersion, UUID> {
    List<RegressionPackVersion> findAllByRegressionPackIdOrderByVersionNumberAsc(UUID packId);
    Optional<RegressionPackVersion> findTopByRegressionPackIdOrderByVersionNumberDesc(UUID packId);
    Optional<RegressionPackVersion> findByRegressionPackIdAndVersionNumber(UUID packId, Integer versionNumber);
}
