package com.regression.regressionsession.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdateSessionStatusRequest {

    @NotBlank
    private String status;
}
