package ru.perminov.tender.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryDtoUpdate(
    @NotBlank(message = "Название категории не может быть пустым")
    String name
) {} 