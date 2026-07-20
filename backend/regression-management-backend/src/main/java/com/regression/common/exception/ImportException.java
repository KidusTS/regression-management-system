package com.regression.common.exception;

import lombok.Getter;

import java.util.List;

@Getter
public class ImportException extends RuntimeException {

    private final List<String> errors;

    public ImportException(String message, List<String> errors) {
        super(message);
        this.errors = errors;
    }

    public ImportException(String message) {
        super(message);
        this.errors = List.of(message);
    }
}
