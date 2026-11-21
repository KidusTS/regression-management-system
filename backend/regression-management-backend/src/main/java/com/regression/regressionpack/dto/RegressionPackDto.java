package com.regression.regressionpack.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    // Lombok would expose this as "active"; the API contract (and frontend) use "isActive".
    @Getter(onMethod_ = @JsonProperty("isActive"))
    private boolean isActive;
    private int versionCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
