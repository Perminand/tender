package ru.perminov.tender.dto.tender;

import lombok.Data;
import ru.perminov.tender.model.SupplierProposal;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class SupplierProposalDto {
    private UUID id;
    private UUID tenderId;
    private UUID supplierId;
    private String supplierName;
    private String proposalNumber;
    private LocalDateTime submissionDate;
    private LocalDateTime validUntil;
    private SupplierProposal.ProposalStatus status;
    private String coverLetter;
    private String technicalProposal;
    private String commercialTerms;
    private Double totalPrice;
    private String currency;
    private String paymentTerms;
    private String deliveryTerms;
    private String warrantyTerms;
    private List<ProposalItemDto> proposalItems;
    private Boolean isBestOffer;
    private Double priceDifference;
} 