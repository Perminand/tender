package ru.perminov.tender.dto.customer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record RequestHierarchyDto(
    UUID requestId,
    String requestNumber,
    LocalDate date,
    String location,
    BigDecimal amount,
    String status,
    List<TenderHierarchyDto> tenders
) {} 