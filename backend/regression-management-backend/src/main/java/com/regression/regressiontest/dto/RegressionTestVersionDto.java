package com.regression.regressiontest.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
public class RegressionTestVersionDto {
    private UUID id;
    private UUID regressionTestId;
    private String testIdRef;
    private int versionNumber;
    private String module;
    private String feature;
    private String title;
    private String preconditions;
    private String testSteps;
    private String expectedResult;
    private String priority;
    private String automationStatus;
    private String status;
    private String changeType;
    private LocalDateTime createdAt;
}
