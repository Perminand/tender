package ru.perminov.tender.dto.tender;

import lombok.Data;

import java.util.UUID;

@Data
public class ProposalItemDto {
    private UUID id;
    private UUID supplierProposalId;
    private UUID tenderItemId;
    private Integer itemNumber;
    private String description;
    private String brand;
    private String model;
    private String manufacturer;
    private String countryOfOrigin;
    private Double quantity;
    private UUID unitId;
    private String unitName;
    private Double unitPrice;
    private Double totalPrice;
    private String specifications;
    private String deliveryPeriod;
    private String warranty;
    private String additionalInfo;
    private Boolean isBestPrice;
    private Double priceDifference;
} 