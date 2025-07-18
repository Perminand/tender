package ru.perminov.tender.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        String message = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        boolean matched = false;
        if (message != null) {
            // Универсальный парсер: ищем имя поля или constraint в сообщении
            String lowerMsg = message.toLowerCase();
            if (lowerMsg.contains("bank_account")) {
                errors.put("bankAccount", "Такой расчетный счет уже существует");
                matched = true;
            }
            if (lowerMsg.contains("inn")) {
                errors.put("inn", "Компания с таким ИНН уже существует");
                matched = true;
            }
            if (lowerMsg.contains("kpp")) {
                errors.put("kpp", "Компания с таким КПП уже существует");
                matched = true;
            }
            if (lowerMsg.contains("ogrn")) {
                errors.put("ogrn", "Компания с таким ОГРН уже существует");
                matched = true;
            }
            // Можно добавить другие поля по аналогии
        }
        if (!matched) {
            errors.put("global", "Ошибка сохранения: " + message);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Внутренняя ошибка сервера: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}