package ru.perminov.tender.dto.material;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record MaterialDtoNew(

    @NotBlank(message = "Название не может быть пустым")
    String name,

    String description,

    String type,

    String link,

    String unit,

    String code,

    UUID categoryId

) {} 