package ru.perminov.tender.dto.company.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ContactDtoNew(
    @NotNull(message = "ID контактного лица не может быть пустым")
    UUID contactPersonId,

    @NotBlank(message = "Тип контакта не может быть пустым")
    String type,

    @NotBlank(message = "Значение контакта не может быть пустым")
    String value
) {} 