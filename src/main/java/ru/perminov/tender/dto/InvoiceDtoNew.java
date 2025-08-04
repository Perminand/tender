package ru.perminov.tender.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class InvoiceDtoNew {
    private UUID contractId;
    private UUID supplierId;
    private UUID requestId;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private BigDecimal vatAmount;
    private String currency;
    private String paymentTerms;
    private String notes;
    private List<InvoiceItemDtoNew> invoiceItems;
} 