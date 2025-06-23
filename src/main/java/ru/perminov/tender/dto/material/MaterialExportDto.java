package ru.perminov.tender.dto.material;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record MaterialExportDto(
        UUID id,
        String name,
        String description,
        String materialTypeId,
        String materialTypeName,
        String link,
        String code,
        String categoryId,
        String categoryName,
        List<String> unitNames,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
} 