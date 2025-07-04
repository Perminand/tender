package ru.perminov.tender.dto.tender;

import lombok.Data;

import java.util.UUID;

@Data
public class TenderItemDto {
    private UUID id;
    private UUID tenderId;
    private UUID requestMaterialId;
    private Integer itemNumber;
    private String description;
    private Double quantity;
    private UUID unitId;
    private String unitName;
    private String specifications;
    private String deliveryRequirements;
    private Double estimatedPrice;
    private String materialName;
    private String materialTypeName;
} 