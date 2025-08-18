package ru.perminov.tender.dto;

import lombok.Data;
import ru.perminov.tender.model.AdditionalExpense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AdditionalExpenseDto {

    private UUID id;

    private UUID supplierProposalId;

    private UUID expenseProviderId;

    private String expenseProviderName;

    private String expenseType;

    private String description;

    private BigDecimal amount;

    private String currency;

    private String invoiceNumber;

    private LocalDate invoiceDate;

    private String documentPath;

    private String notes;

    private AdditionalExpense.ExpenseStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
