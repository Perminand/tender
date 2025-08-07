package ru.perminov.tender.dto.contract;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ContractItemDto {
    private UUID id;
    private UUID contractId;
    private UUID materialId;
    private String materialName;
    private BigDecimal quantity;
    private UUID unitId;
    private String unitName;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String description;
} 