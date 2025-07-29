package ru.perminov.tender.dto.customer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PaymentDto(
    String documentNumber,
    LocalDate documentDate,
    BigDecimal amount,
    String documentType,
    List<PaymentItemDto> items
) {} 