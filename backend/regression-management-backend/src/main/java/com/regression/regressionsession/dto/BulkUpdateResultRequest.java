package com.regression.regressionsession.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter @Setter
public class BulkUpdateResultRequest {

    @NotEmpty
    private List<ResultEntry> results;

    @Getter @Setter
    public static class ResultEntry {
        private UUID resultId;
        private String result;
        private String comment;
    }
}
