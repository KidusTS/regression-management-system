package com.regression.regressionpack.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
public class RegressionPackDto {
    private UUID id;
    private String name;
    private String description;
    private String project;
    private boolean isActive;
    private int versionCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
