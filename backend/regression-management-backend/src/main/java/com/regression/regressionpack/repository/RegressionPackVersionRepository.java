package com.regression.regressionpack.repository;

import com.regression.regressionpack.entity.RegressionPackVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RegressionPackVersionRepository extends JpaRepository<RegressionPackVersion, UUID> {

    @Query("SELECT v FROM RegressionPackVersion v " +
           "JOIN FETCH v.regressionPack " +
           "LEFT JOIN FETCH v.testVersions tv " +
           "LEFT JOIN FETCH tv.regressionTest " +
           "WHERE v.regressionPack.id = :packId " +
           "ORDER BY v.versionNumber ASC")
    List<RegressionPackVersion> findAllByRegressionPackIdOrderByVersionNumberAsc(@Param("packId") UUID packId);

    @Query("SELECT v FROM RegressionPackVersion v " +
           "JOIN FETCH v.regressionPack " +
           "LEFT JOIN FETCH v.testVersions tv " +
           "LEFT JOIN FETCH tv.regressionTest " +
           "WHERE v.regressionPack.id = :packId " +
           "ORDER BY v.versionNumber DESC " +
           "LIMIT 1")
    Optional<RegressionPackVersion> findTopByRegressionPackIdOrderByVersionNumberDesc(@Param("packId") UUID packId);

    @Query("SELECT v FROM RegressionPackVersion v " +
           "JOIN FETCH v.regressionPack " +
           "LEFT JOIN FETCH v.testVersions tv " +
           "LEFT JOIN FETCH tv.regressionTest " +
           "WHERE v.id = :id")
    Optional<RegressionPackVersion> findByIdWithDetails(@Param("id") UUID id);

    Optional<RegressionPackVersion> findByRegressionPackIdAndVersionNumber(UUID packId, Integer versionNumber);

    @Query("SELECT COUNT(tv) FROM RegressionPackVersion v JOIN v.testVersions tv WHERE v.id = :versionId")
    int countTestsByVersionId(@Param("versionId") UUID versionId);
}
