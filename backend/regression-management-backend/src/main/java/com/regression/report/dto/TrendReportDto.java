package com.regression.report.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class TrendReportDto {
    private UUID sessionId;
    private String sessionName;
    private String softwareVersion;
    private int total;
    private int passed;
    private double passRate;
    private LocalDateTime createdAt;
}
