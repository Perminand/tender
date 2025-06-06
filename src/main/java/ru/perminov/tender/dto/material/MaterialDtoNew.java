package ru.perminov.tender.dto.material;

import jakarta.validation.constraints.NotBlank;

public record MaterialDtoNew(
    @NotBlank(message = "Название не может быть пустым")
    String name,
    String description,
    String type,
    String link
) {} 