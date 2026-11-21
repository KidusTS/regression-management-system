package com.regression.common.exception;

/** The request was well-formed JSON but asks for something invalid (maps to HTTP 400). */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
