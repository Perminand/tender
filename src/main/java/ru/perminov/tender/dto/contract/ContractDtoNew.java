package ru.perminov.tender.dto.contract;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ContractDtoNew {
    private String contractNumber;
    private String title;
    private UUID tenderId;
    private UUID supplierId;
    private BigDecimal totalAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String terms;
    private String description;
} 