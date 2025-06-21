package ru.perminov.tender.dto.company.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record ContactTypeDtoUpdate(

    @NotNull
    UUID id,

    @NotBlank(message = "Название типа контакта не может быть пустым")
    String name
) {} 