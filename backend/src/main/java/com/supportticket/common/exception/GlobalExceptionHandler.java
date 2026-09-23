package com.supportticket.common.exception;

import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<Map<String, Object>> handleNotFound(EntityNotFoundException ex) {
    return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<Map<String, Object>> handleDataIntegrity(
      DataIntegrityViolationException ex) {
    return buildResponse(
        HttpStatus.BAD_REQUEST,
        "This operation violates a data constraint and cannot be completed."
    );
  }

  @ExceptionHandler(InvalidStateTransitionException.class)
  public ResponseEntity<Map<String, Object>> handleInvalidTransition(
      InvalidStateTransitionException ex) {
    return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
  }

  @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
  public ResponseEntity<Map<String, Object>> handleBadRequest(RuntimeException ex) {
    return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
    return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
  }

  private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
    return ResponseEntity.status(status)
        .body(
            Map.of(
                "status", status.value(),
                "message", message != null ? message : "An error occurred",
                "timestamp", OffsetDateTime.now().toString()));
  }
}
