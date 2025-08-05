package ru.perminov.tender.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class InvoiceItemDto {
    private UUID id;
    private UUID invoiceId;
    private UUID materialId;
    private String materialName;
    private String description;
    private BigDecimal quantity;
    private UUID unitId;
    private String unitName;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
} 