package ru.perminov.tender.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CharacteristicDto(
    UUID id,
    String name,
    String description,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {} 