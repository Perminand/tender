package ru.perminov.tender.dto.contract;

import jakarta.validation.constraints.FutureOrPresent;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ContractDtoUpdate {

    private String contractNumber;

    private String title;

    private String status;

    private BigDecimal totalAmount;

    @FutureOrPresent(message = "Дата начала не может быть раньше текущей")
    private LocalDate startDate;

    @FutureOrPresent(message = "Дата начала не может быть раньше текущей")
    private LocalDate endDate;

    private String terms;

    private String description;
} 