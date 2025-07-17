package ru.perminov.tender.dto.report;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class SupplierReportDto {
    private UUID supplierId;
    private String supplierName;
    private String supplierEmail;
    private String supplierPhone;
    
    // Рейтинг поставщика
    private BigDecimal overallRating;
    private Integer qualityRating;
    private Integer deliveryTimeRating;
    private Integer priceRating;
    private Integer communicationRating;
    private Integer reliabilityRating;
    
    // Статистика работы
    private Integer totalContracts;
    private Integer completedContracts;
    private Integer activeContracts;
    private Integer delayedDeliveries;
    private Integer qualityIssues;
    private BigDecimal totalAmount;
    private BigDecimal averageSavings;
    
    // История работы
    private List<ContractHistoryDto> contractHistory;
    private List<DeliveryHistoryDto> deliveryHistory;
    private List<PaymentHistoryDto> paymentHistory;
    
    // Рекомендации
    private List<String> recommendations;
    private String riskLevel; // LOW, MEDIUM, HIGH
    private String status; // ACTIVE, SUSPENDED, BLACKLISTED
    
    // Последние активности
    private LocalDate lastContractDate;
    private LocalDate lastDeliveryDate;
    private LocalDate lastPaymentDate;
    
    // Тренды
    private String ratingTrend; // IMPROVING, STABLE, DECLINING
    private String performanceTrend;
    private BigDecimal priceCompetitiveness;
    
    @Data
    public static class ContractHistoryDto {
        private UUID contractId;
        private String contractNumber;
        private LocalDate contractDate;
        private BigDecimal contractAmount;
        private String status;
        private BigDecimal savings;
    }
    
    @Data
    public static class DeliveryHistoryDto {
        private UUID deliveryId;
        private String deliveryNumber;
        private LocalDate plannedDate;
        private LocalDate actualDate;
        private String status;
        private Integer daysDelay;
        private String qualityNotes;
    }
    
    @Data
    public static class PaymentHistoryDto {
        private UUID paymentId;
        private String paymentNumber;
        private LocalDate dueDate;
        private LocalDate paidDate;
        private BigDecimal amount;
        private String status;
        private Integer daysOverdue;
    }
} 