package ru.perminov.tender.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class InvoiceDtoUpdate {
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private LocalDate paymentDate;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal vatAmount;
    private String currency;
    private String paymentTerms;
    private String notes;
    private List<InvoiceItemDtoUpdate> invoiceItems;
} 