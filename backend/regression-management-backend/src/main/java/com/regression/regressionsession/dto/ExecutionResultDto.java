package com.regression.regressionsession.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
public class ExecutionResultDto {
    private UUID id;
    private UUID sessionId;
    private UUID testVersionId;
    private String testIdRef;
    private String testTitle;
    private String module;
    private String feature;
    private String result;
    private String comment;
    private LocalDateTime executedAt;
    private LocalDateTime updatedAt;
}
