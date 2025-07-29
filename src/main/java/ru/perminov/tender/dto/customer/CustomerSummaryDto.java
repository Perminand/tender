package ru.perminov.tender.dto.customer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CustomerSummaryDto(
    UUID customerId,
    String customerName,
    String customerShortName,
    String requestNumber,
    String requestType, // "Заявка", "Тендер", "Поставка"
    LocalDate date,
    String location,
    BigDecimal amount,
    String status
) {} 