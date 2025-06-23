package ru.perminov.tender.dto;

import java.util.UUID;

public record ProjectObjectDto(
        UUID id,
        String name,
        String description
) {
} 