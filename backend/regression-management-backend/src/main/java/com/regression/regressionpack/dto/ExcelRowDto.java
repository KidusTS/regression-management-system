package com.regression.regressionpack.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExcelRowDto {
    private String module;
    private String feature;
    private String testIdRef;
    private String title;
    private String preconditions;
    private String testSteps;
    private String expectedResult;
    private String priority;
    private String automationStatus;
    private String status;
}
