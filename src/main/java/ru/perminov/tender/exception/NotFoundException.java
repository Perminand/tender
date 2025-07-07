package ru.perminov.tender.exception;
 
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
} 