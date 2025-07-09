package ru.perminov.tender.dto.delivery;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class DeliveryItemDto {
    private UUID id;
    private UUID deliveryId;
    private UUID materialId;
    private String materialName;
    private BigDecimal quantity;
    private String unitName;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String qualityStatus;
    private String notes;
} 