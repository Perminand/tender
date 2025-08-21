package ru.perminov.tender.dto.tender;

import jakarta.validation.constraints.Positive;
import lombok.Data;
import ru.perminov.tender.model.SupplierProposal;
import ru.perminov.tender.dto.PaymentConditionDto;
import ru.perminov.tender.dto.DeliveryConditionDto;
import ru.perminov.tender.model.DeliveryCondition;
import java.math.BigDecimal;
import ru.perminov.tender.dto.AdditionalExpenseDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class SupplierProposalDto {

    private UUID id;

    private UUID tenderId;

    private String tenderNumber;
    
    private String tenderTitle;

    private UUID supplierId;
    
    private String supplierName;

    private String proposalNumber;

    private LocalDateTime submissionDate;

    private LocalDateTime validUntil;

    private SupplierProposal.ProposalStatus status;

    private String coverLetter;

    private String technicalProposal;

    private String commercialTerms;

    @Positive(message = "Общая стоимость должна быть больше 0")
    private Double totalPrice;

    private String currency;

    private String paymentTerms;

    private String deliveryTerms;

    private String warrantyTerms;

    private UUID paymentConditionId;
    private PaymentConditionDto paymentCondition;

    // Связь с условием доставки
    private UUID deliveryConditionId;
    private DeliveryConditionDto deliveryCondition;

    // Инлайновые поля условий доставки (для обратной совместимости)
    private String deliveryType;
    private BigDecimal deliveryCost;
    private String deliveryAddress;
    private String deliveryPeriod;
    private DeliveryCondition.DeliveryResponsibility deliveryResponsibility;
    private String deliveryAdditionalTerms;
    private String deliveryConditionName;
    private String deliveryConditionDescription;

    private List<ProposalItemDto> proposalItems;

    private List<AdditionalExpenseDto> additionalExpenses;

    private Boolean isBestOffer;

    private Double priceDifference;
    
} 