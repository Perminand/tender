package ru.perminov.tender.dto.company.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;
import java.util.List;

public record ContactPersonDtoNew(
        UUID uuid,

        @NotNull(message = "ID компании не может быть пустым")
        UUID companyUuid,

        @NotBlank(message = "Фамилия не может быть пустой")
        String lastName,

        @NotBlank(message = "Имя не может быть пустым")
        String firstName,

        @NotBlank(message = "Должность не может быть пустой")
        String position,


        @NotNull(message = "Тип контакта не может быть пустым")
        UUID contactTypeUuid,

        List<ContactDtoNew> contacts
) {
}