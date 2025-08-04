package ru.perminov.tender.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class InvoiceItemDtoUpdate {
    private UUID id;
    private UUID materialId;
    private String description;
    private BigDecimal quantity;
    private UUID unitId;
    private BigDecimal unitPrice;
    private BigDecimal vatRate;
    private String notes;
} 