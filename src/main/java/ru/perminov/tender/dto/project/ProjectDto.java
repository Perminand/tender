package ru.perminov.tender.dto.project;

import java.util.UUID;

public record ProjectDto(
    UUID id,
    String name,
    String description
) {} 