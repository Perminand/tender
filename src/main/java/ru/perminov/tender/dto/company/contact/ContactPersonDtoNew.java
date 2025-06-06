package ru.perminov.tender.dto.company.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record ContactPersonDtoNew(
    @NotNull(message = "ID компании не может быть пустым")
    UUID companyUuid,

    @NotBlank(message = "Фамилия не может быть пустой")
    String lastName,

    @NotBlank(message = "Имя не может быть пустым")
    String firstName,

    String middleName,

    @NotBlank(message = "Должность не может быть пустой")
    String position,

    @Pattern(regexp = "^\\+?[1-9]\\d{10,14}$", message = "Неверный формат телефона")
    String phone,

    @Email(message = "Неверный формат email")
    String email
) {} 