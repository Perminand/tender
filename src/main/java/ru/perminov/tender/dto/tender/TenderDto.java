package ru.perminov.tender.dto.tender;

import lombok.Data;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.dto.company.CompanyDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class TenderDto {
    private UUID id;
    private UUID requestId;
    private String tenderNumber;
    private String title;
    private String description;
    private UUID customerId;
    private String customerName;
    private CompanyDto customer;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime submissionDeadline;
    private Tender.TenderStatus status;
    private String requirements;
    private String termsAndConditions;
    private List<TenderItemDto> tenderItems;
    private List<SupplierProposalDto> supplierProposals;
    private Integer proposalsCount;
    private Double bestPrice;
    private String bestSupplierName;
    private UUID awardedSupplierId;
    private CompanyDto awardedSupplier;
    private UUID parentTenderId;
    private UUID warehouseId;
    private String warehouseName;
} 