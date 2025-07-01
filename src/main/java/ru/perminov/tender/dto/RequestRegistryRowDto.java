package ru.perminov.tender.dto;

import java.time.LocalDate;
import java.util.UUID;

public record RequestRegistryRowDto(
    UUID requestId,
    String requestNumber,
    LocalDate requestDate,
    String organization,
    String project,
    Integer materialsCount,
    Double totalQuantity,
    String note
) {} 