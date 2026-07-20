package com.regression.regressionpack.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class ImportResultDto {
    private UUID newVersionId;
    private int versionNumber;
    private int added;
    private int modified;
    private int unchanged;
    private int removed;
    private int total;
}
