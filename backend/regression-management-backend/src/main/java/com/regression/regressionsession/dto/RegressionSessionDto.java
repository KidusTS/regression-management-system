package com.regression.regressionsession.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
public class RegressionSessionDto {
    private UUID id;
    private String name;
    private String description;
    private UUID packVersionId;
    private int packVersionNumber;
    private String packName;
    private String softwareVersion;
    private String environment;
    private String status;
    private int totalTests;
    private int passed;
    private int failed;
    private int blocked;
    private int skipped;
    private int notRun;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
