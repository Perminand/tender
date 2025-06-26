package ru.perminov.tender.dto.material;

import ru.perminov.tender.dto.CategoryDto;
import ru.perminov.tender.dto.MaterialTypeDto;
import ru.perminov.tender.dto.UnitDto;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.List;

public record MaterialDto(
    UUID id,
    String name,
    String description,
    MaterialTypeDto materialType,
    String link,
    Set<UnitDto> units,
    String code,
    CategoryDto category,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}