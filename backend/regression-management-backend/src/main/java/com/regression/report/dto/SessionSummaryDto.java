package com.regression.report.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class SessionSummaryDto {
    private UUID sessionId;
    private String sessionName;
    private int total;
    private int passed;
    private int failed;
    private int blocked;
    private int skipped;
    private int notRun;
    private double passRate;
}
