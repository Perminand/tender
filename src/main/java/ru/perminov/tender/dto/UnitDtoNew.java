package ru.perminov.tender.dto;

import jakarta.validation.constraints.NotBlank;

public record UnitDtoNew(
    @NotBlank(message = "Название единицы измерения не может быть пустым")
    String name,
    
    @NotBlank(message = "Сокращенное название не может быть пустым")
    String shortName
) {} 