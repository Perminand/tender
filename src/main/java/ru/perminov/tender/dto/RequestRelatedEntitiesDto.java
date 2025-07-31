package ru.perminov.tender.dto;

import java.util.List;
import java.util.UUID;

public record RequestRelatedEntitiesDto(
    UUID requestId,
    String requestNumber,
    List<TenderInfo> tenders,
    List<InvoiceInfo> invoices,
    boolean hasRelatedEntities
) {
    public record TenderInfo(
        UUID id,
        String tenderNumber,
        String title,
        String status
    ) {}
    
    public record InvoiceInfo(
        UUID id,
        String invoiceNumber,
        String status,
        String supplierName
    ) {}
} 