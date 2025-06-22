package ru.perminov.tender.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryDtoNew(
    @NotBlank(message = "Название категории не может быть пустым")
    String name
) {} 