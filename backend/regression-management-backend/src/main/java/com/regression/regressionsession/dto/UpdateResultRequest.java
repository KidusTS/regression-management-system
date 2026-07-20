package com.regression.regressionsession.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdateResultRequest {

    @NotNull
    private String result;

    private String comment;
}
