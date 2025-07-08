package ru.perminov.tender.dto.tender;

import java.util.UUID;

public record SupplierPriceDto(
    UUID supplierId,
    String supplierName,
    String supplierEmail,
    UUID proposalId,
    String proposalNumber,
    UUID tenderItemId,
    Double unitPrice,
    Double totalPrice,
    String currency,
    String deliveryPeriod,
    String warranty,
    String additionalInfo,
    boolean isBestPrice
) {} 