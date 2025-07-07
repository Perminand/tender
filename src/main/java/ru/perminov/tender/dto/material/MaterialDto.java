package ru.perminov.tender.dto.material;

import ru.perminov.tender.dto.CategoryDto;
import ru.perminov.tender.dto.MaterialTypeDto;
import ru.perminov.tender.dto.UnitDto;
import ru.perminov.tender.dto.CharacteristicDto;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.List;

public record MaterialDto(
    UUID id,

    @NotBlank(message = "Название материала не может быть пустым")
    String name,

    String description,

    List<CharacteristicDto> characteristics,

    MaterialTypeDto materialType,

    String link,

    Set<UnitDto> units,

    String code,

    CategoryDto category,

    LocalDateTime createdAt,

    LocalDateTime updatedAt
) {}