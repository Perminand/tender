package ru.perminov.tender.dto.customer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CustomerHierarchyDto(
    UUID customerId,
    String customerName,
    String customerShortName,
    List<RequestHierarchyDto> requests
) {} 