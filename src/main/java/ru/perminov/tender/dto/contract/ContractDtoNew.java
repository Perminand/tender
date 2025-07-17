package ru.perminov.tender.dto.contract;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContractDtoNew (
     String contractNumber,
     String title,
     UUID tenderId,
     UUID supplierId,
     BigDecimal totalAmount,
     LocalDate startDate,
     LocalDate endDate,
     String terms,
     String description
){
} 