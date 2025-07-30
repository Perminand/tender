package ru.perminov.tender.dto.tender;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import ru.perminov.tender.dto.dictionary.BrandDto;
import ru.perminov.tender.dto.dictionary.CountryDto;
import ru.perminov.tender.dto.dictionary.ManufacturerDto;
import ru.perminov.tender.dto.dictionary.WarrantyDto;

import java.util.UUID;

@Data
public class ProposalItemDto {

    private UUID id;

    private UUID supplierProposalId;

    private UUID tenderItemId;

    private Integer itemNumber;

    private String description;

    private BrandDto brand;

    private String model;

    private ManufacturerDto manufacturer;

    private CountryDto countryOfOrigin;

        @NotNull(message = "Количество обязательно для заполнения")
    @Positive(message = "Количество должно быть больше 0")
    private Double quantity;

    private UUID unitId;

    private String unitName;

    @NotNull(message = "Цена за единицу обязательна для заполнения")
    @Positive(message = "Цена за единицу должна быть больше 0")
    private Double unitPrice;
    
    @Positive(message = "Общая стоимость должна быть больше 0")
    private Double totalPrice;

    private String specifications;

    private String deliveryPeriod;

    private WarrantyDto warranty;

    private String additionalInfo;
    
    private Boolean isBestPrice;
    private Double priceDifference;
    
    private Double unitPriceWithVat;
    
    private Double weight;
    
    private Double deliveryCost;
    
} 