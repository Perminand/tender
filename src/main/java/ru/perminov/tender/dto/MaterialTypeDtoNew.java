package ru.perminov.tender.dto;

import jakarta.validation.constraints.NotBlank;

public record MaterialTypeDtoNew(
    @NotBlank(message = "Название типа материала не может быть пустым")
    String name
) {} 