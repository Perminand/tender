package ru.perminov.tender.dto;

import java.time.LocalDate;
import java.util.UUID;

public record RequestRegistryRowDto(
    UUID requestId,
    String requestNumber,
    LocalDate requestDate,
    String organization,
    String project,
    String status,
    String materialName,
    String section,
    String workType,
    String size,
    Double quantity,
    String unit,
    String note,
    String deliveryDate
) {} 