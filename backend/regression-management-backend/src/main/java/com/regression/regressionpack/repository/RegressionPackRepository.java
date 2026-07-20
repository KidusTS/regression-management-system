package com.regression.regressionpack.repository;

import com.regression.regressionpack.entity.RegressionPack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RegressionPackRepository extends JpaRepository<RegressionPack, UUID> {
    List<RegressionPack> findAllByIsActiveTrueOrderByCreatedAtDesc();
}
