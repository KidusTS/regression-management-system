package com.regression.regressionpack.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Getter @Setter
public class RegressionPackVersionDto {
    private UUID id;
    private UUID regressionPackId;
    private int versionNumber;
    private String label;
    private String sourceFileName;
    private Map<String, Object> importSummary;
    private int testCount;
    private LocalDateTime createdAt;
}
