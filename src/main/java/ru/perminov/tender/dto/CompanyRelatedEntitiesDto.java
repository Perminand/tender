package ru.perminov.tender.dto;

import java.util.List;
import java.util.UUID;

public record CompanyRelatedEntitiesDto(
    UUID companyId,
    String companyName,
    List<RequestInfo> requests,
    List<TenderInfo> tenders,
    List<InvoiceInfo> invoices,
    List<PaymentInfo> payments,
    List<ContractInfo> contracts,
    List<DeliveryInfo> deliveries,
    List<DocumentInfo> documents,
    boolean hasRelatedEntities
) {
    public record RequestInfo(
        UUID id,
        String requestNumber,
        String status
    ) {}
    
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
        String role // supplier или customer
    ) {}
    
    public record PaymentInfo(
        UUID id,
        String paymentNumber,
        String status,
        String role // supplier или customer
    ) {}
    
    public record ContractInfo(
        UUID id,
        String contractNumber,
        String status,
        String role // supplier или customer
    ) {}
    
    public record DeliveryInfo(
        UUID id,
        String deliveryNumber,
        String status
    ) {}
    
    public record DocumentInfo(
        UUID id,
        String fileName,
        String documentType
    ) {}
} 