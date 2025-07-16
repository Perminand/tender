package ru.perminov.tender.dto.payment;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PaymentDto {
    private UUID id;
    private String paymentNumber;
    private UUID contractId;
    private UUID supplierId;
    private String supplierName;
    private String paymentType;
    private String status;
    private BigDecimal amount;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private String invoiceNumber;
    private String notes;
    private String contractNumber;
    private String deliveryNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 