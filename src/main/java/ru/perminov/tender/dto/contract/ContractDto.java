package ru.perminov.tender.dto.contract;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ContractDto {
    private UUID id;
    private String contractNumber;
    private String title;
    private UUID tenderId;
    private UUID supplierId;
    private UUID customerId;
    private String status;
    private BigDecimal totalAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String terms;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 