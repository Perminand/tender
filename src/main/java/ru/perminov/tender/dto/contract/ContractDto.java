package ru.perminov.tender.dto.contract;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import ru.perminov.tender.dto.tender.TenderDto;

@Data
public class ContractDto {
    private UUID id;
    private String contractNumber;
    private String title;
    private UUID tenderId;
    private String status;
    private BigDecimal totalAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String terms;
    private String description;
    private String paymentTerms;
    private String deliveryTerms;
    private String warrantyTerms;
    private String specialConditions;
    private String currency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ContractItemDto> contractItems;
    private TenderDto tender;
    private UUID warehouseId;
    private String warehouseName;
} 