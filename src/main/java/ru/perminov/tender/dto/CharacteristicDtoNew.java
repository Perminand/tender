package ru.perminov.tender.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CharacteristicDtoNew(

    @NotBlank(message = "Название характеристики не может быть пустым")
    String name,

    String description,

    @NotNull(message = "ID материала не может быть пустым")
    UUID materialId

) {} 