package com.regression.regressionsession.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter
public class CreateSessionRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private UUID packVersionId;

    private String softwareVersion;
    private String environment;
}
