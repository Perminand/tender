package ru.perminov.tender.dto;

import java.util.UUID;

public record WarehouseDto(
    UUID id,
    String name,
    UUID projectId
) {} 