package ru.perminov.tender.dto.customer;

import java.math.BigDecimal;

public record PaymentItemDto(
    String materialName,
    String description,
    BigDecimal quantity,
    String unit,
    BigDecimal unitPrice,
    BigDecimal totalPrice
) {} 