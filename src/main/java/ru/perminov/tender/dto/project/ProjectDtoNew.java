package ru.perminov.tender.dto.project;

import jakarta.validation.constraints.NotBlank;

public record ProjectDtoNew(
    @NotBlank(message = "Название проекта не может быть пустым")
    String name,
    String description
) {} 