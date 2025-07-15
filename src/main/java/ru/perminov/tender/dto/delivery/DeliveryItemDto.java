package ru.perminov.tender.dto.delivery;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class DeliveryItemDto {
    private UUID id;
    private UUID deliveryId;
    private UUID contractItemId;
    private UUID materialId;
    private String materialName;
    private String description;
    private Integer itemNumber;
    private BigDecimal orderedQuantity;
    private BigDecimal deliveredQuantity;
    private BigDecimal acceptedQuantity;
    private BigDecimal rejectedQuantity;
    private UUID unitId;
    private String unitName;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String qualityNotes;
    private String rejectionReason;
    private String acceptanceStatus;
} 