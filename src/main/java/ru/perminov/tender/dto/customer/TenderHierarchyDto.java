package ru.perminov.tender.dto.customer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TenderHierarchyDto(
    UUID tenderId,
    String tenderNumber,
    LocalDate date,
    String location,
    BigDecimal amount,
    String status,
    List<DeliveryHierarchyDto> deliveries
) {} 