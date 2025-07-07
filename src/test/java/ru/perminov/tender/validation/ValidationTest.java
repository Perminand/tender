package ru.perminov.tender.validation;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ValidationTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testMaterialDtoNewValid() {
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "Валидный материал",
                "Описание",
                UUID.randomUUID(),
                "https://example.com",
                Set.of(UUID.randomUUID()),
                "TEST001",
                UUID.randomUUID()
        );

        Set<ConstraintViolation<MaterialDtoNew>> violations = validator.validate(materialDtoNew);
        assertTrue(violations.isEmpty(), "Не должно быть нарушений валидации");
    }

    @Test
    void testMaterialDtoNewInvalidName() {
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "", // пустое имя
                "Описание",
                UUID.randomUUID(),
                "https://example.com",
                Set.of(UUID.randomUUID()),
                "TEST001",
                UUID.randomUUID()
        );

        Set<ConstraintViolation<MaterialDtoNew>> violations = validator.validate(materialDtoNew);
        assertFalse(violations.isEmpty(), "Должны быть нарушения валидации");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("name")));
    }

    @Test
    void testMaterialDtoNewInvalidLink() {
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "Валидный материал",
                "Описание",
                UUID.randomUUID(),
                "invalid-url", // невалидный URL
                Set.of(UUID.randomUUID()),
                "TEST001",
                UUID.randomUUID()
        );

        Set<ConstraintViolation<MaterialDtoNew>> violations = validator.validate(materialDtoNew);
        assertFalse(violations.isEmpty(), "Должны быть нарушения валидации");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("link")));
    }

    @Test
    void testMaterialDtoUpdateValid() {
        MaterialDtoUpdate materialDtoUpdate = new MaterialDtoUpdate(
                "Обновленный материал",
                "Описание",
                UUID.randomUUID(),
                "https://example.com",
                Set.of(UUID.randomUUID()),
                "UPD001",
                UUID.randomUUID()
        );

        Set<ConstraintViolation<MaterialDtoUpdate>> violations = validator.validate(materialDtoUpdate);
        assertTrue(violations.isEmpty(), "Не должно быть нарушений валидации");
    }

    @Test
    void testMaterialDtoUpdateInvalidName() {
        MaterialDtoUpdate materialDtoUpdate = new MaterialDtoUpdate(
                null, // null имя
                "Описание",
                UUID.randomUUID(),
                "https://example.com",
                Set.of(UUID.randomUUID()),
                "UPD001",
                UUID.randomUUID()
        );

        Set<ConstraintViolation<MaterialDtoUpdate>> violations = validator.validate(materialDtoUpdate);
        assertFalse(violations.isEmpty(), "Должны быть нарушения валидации");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("name")));
    }

    @Test
    void testMaterialDtoUpdateInvalidCode() {
        MaterialDtoUpdate materialDtoUpdate = new MaterialDtoUpdate(
                "Валидный материал",
                "Описание",
                UUID.randomUUID(),
                "https://example.com",
                Set.of(UUID.randomUUID()),
                "", // пустой код
                UUID.randomUUID()
        );

        Set<ConstraintViolation<MaterialDtoUpdate>> violations = validator.validate(materialDtoUpdate);
        assertFalse(violations.isEmpty(), "Должны быть нарушения валидации");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("code")));
    }

    @Test
    void testValidationWithNullValues() {
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "Валидный материал",
                null, // null описание
                null, // null materialTypeId
                null, // null link
                null, // null unitIds
                null, // null code
                null  // null categoryId
        );

        Set<ConstraintViolation<MaterialDtoNew>> violations = validator.validate(materialDtoNew);
        
        // Проверяем, что есть нарушения валидации по обязательным полям
        assertFalse(violations.isEmpty(), "Должны быть нарушения валидации");
        
        // Проверяем, что есть нарушение по полю code (которое теперь обязательно)
        assertTrue(
            violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("code")),
            "Должно быть нарушение валидации по полю code"
        );
        
        // Проверяем, что null значения для необязательных полей не вызывают ошибки
        assertTrue(violations.stream().noneMatch(v -> 
                v.getPropertyPath().toString().equals("description") ||
                v.getPropertyPath().toString().equals("materialTypeId") ||
                v.getPropertyPath().toString().equals("link") ||
                v.getPropertyPath().toString().equals("unitIds") ||
                v.getPropertyPath().toString().equals("categoryId")),
            "Не должно быть нарушений валидации по необязательным полям"
        );
    }
} 