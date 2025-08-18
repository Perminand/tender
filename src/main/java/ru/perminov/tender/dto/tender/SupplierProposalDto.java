package ru.perminov.tender.dto.tender;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import ru.perminov.tender.model.SupplierProposal;
import ru.perminov.tender.dto.PaymentConditionDto;
import ru.perminov.tender.dto.DeliveryConditionDto;

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

    private UUID deliveryConditionId;
    private DeliveryConditionDto deliveryCondition;

    private List<ProposalItemDto> proposalItems;

    private Boolean isBestOffer;

    private Double priceDifference;
    
} 