package ru.perminov.tender.dto.material;

import java.util.Set;
import java.util.UUID;

public record MaterialDtoNew(
        String name,
        String description,
        UUID materialTypeId,
        String link,
        Set<UUID> unitIds,
        String code,
        UUID categoryId
) {
} 