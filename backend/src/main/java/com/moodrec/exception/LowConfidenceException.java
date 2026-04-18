package com.moodrec.exception;

public class LowConfidenceException extends RuntimeException {
    public LowConfidenceException(String message) { super(message); }
}
