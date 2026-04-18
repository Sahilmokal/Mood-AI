package com.moodrec.exception;

import com.moodrec.dto.response.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(NoFaceDetectedException.class)
    public ResponseEntity<ErrorResponse> handleNoFace(NoFaceDetectedException ex) {
        return unprocessable("NO_FACE_DETECTED", ex.getMessage());
    }

    @ExceptionHandler(LowConfidenceException.class)
    public ResponseEntity<ErrorResponse> handleLowConf(LowConfidenceException ex) {
        return unprocessable("LOW_CONFIDENCE", ex.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage(), null);
    }

    @ExceptionHandler(MlServiceException.class)
    public ResponseEntity<ErrorResponse> handleMlService(MlServiceException ex) {
        log.error("ML service error: {}", ex.getMessage(), ex);
        return build(HttpStatus.BAD_GATEWAY, "ML_SERVICE_ERROR",
                "ML service unavailable. Please try again.", null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return build(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password", null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage,
                        (a, b) -> a));
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed", fieldErrors);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxSize(MaxUploadSizeExceededException ex) {
        return build(HttpStatus.BAD_REQUEST, "FILE_TOO_LARGE", "Image must be under 10MB", null);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        return build(HttpStatus.CONFLICT, "CONFLICT", ex.getMessage(), null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected error occurred", null);
    }

    private ResponseEntity<ErrorResponse> unprocessable(String error, String message) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, error, message, null);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String error,
                                                 String message, Map<String, String> fieldErrors) {
        return ResponseEntity.status(status).body(ErrorResponse.builder()
                .error(error).message(message).status(status.value())
                .timestamp(Instant.now()).fieldErrors(fieldErrors).build());
    }
}
