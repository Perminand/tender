package ru.perminov.tender.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@ControllerAdvice
public class StackOverflowHandler {

    @ExceptionHandler(StackOverflowError.class)
    public ResponseEntity<Map<String, String>> handleStackOverflow(StackOverflowError ex) {
        log.error("Обнаружена ошибка переполнения стека: {}", ex.getMessage());

        Map<String, String> error = new HashMap<>();
        error.put("error", "Stack Overflow Error");
        error.put("message", "Произошла ошибка переполнения стека. Проверьте логи сервера.");
        error.put("timestamp", String.valueOf(System.currentTimeMillis()));

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(OutOfMemoryError.class)
    public ResponseEntity<Map<String, String>> handleOutOfMemory(OutOfMemoryError ex) {
        log.error("Обнаружена ошибка нехватки памяти: {}", ex.getMessage());

        Map<String, String> error = new HashMap<>();
        error.put("error", "Out of Memory Error");
        error.put("message", "Произошла ошибка нехватки памяти. Проверьте логи сервера.");
        error.put("timestamp", String.valueOf(System.currentTimeMillis()));

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}