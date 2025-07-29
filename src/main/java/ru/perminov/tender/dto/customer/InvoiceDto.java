package ru.perminov.tender.dto.customer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record InvoiceDto(
    String invoiceNumber,
    LocalDate invoiceDate,
    BigDecimal amount,
    BigDecimal vatAmount,
    LocalDate paymentDate,
    List<InvoiceItemDto> items,
    BigDecimal totalAmount,
    BigDecimal debt
) {} 