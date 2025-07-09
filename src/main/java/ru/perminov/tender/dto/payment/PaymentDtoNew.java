package ru.perminov.tender.dto.payment;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PaymentDtoNew {
    private String paymentNumber;
    private UUID contractId;
    private UUID supplierId;
    private String paymentType;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String invoiceNumber;
    private String notes;
} 