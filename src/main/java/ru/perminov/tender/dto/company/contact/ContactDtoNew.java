package ru.perminov.tender.dto.company.contact;

import java.util.UUID;

public record ContactDtoNew(
    UUID contactTypeUuid,      // UUID существующего типа контакта
    String newTypeName,        // Имя нового типа, если выбран "новый"
    String value               // Значение контакта (телефон, email и т.д.)
) {} 