package com.regression.regressionsession.repository;

import com.regression.regressionsession.entity.RegressionSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RegressionSessionRepository extends JpaRepository<RegressionSession, UUID> {

    @Query("SELECT DISTINCT s FROM RegressionSession s " +
           "JOIN FETCH s.packVersion pv " +
           "JOIN FETCH pv.regressionPack " +
           "LEFT JOIN FETCH s.results " +
           "ORDER BY s.createdAt DESC")
    List<RegressionSession> findAllByOrderByCreatedAtDesc();

    @Query("SELECT s FROM RegressionSession s " +
           "JOIN FETCH s.packVersion pv " +
           "JOIN FETCH pv.regressionPack " +
           "LEFT JOIN FETCH s.results " +
           "WHERE s.id = :id")
    Optional<RegressionSession> findByIdWithDetails(@Param("id") UUID id);
}
