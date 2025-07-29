package ru.perminov.tender.dto.customer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DeliveryHierarchyDto(
    UUID deliveryId,
    String deliveryNumber,
    LocalDate date,
    String supplierName,
    BigDecimal amount,
    String status
) {} 