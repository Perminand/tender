package ru.perminov.tender.dto.report;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class FinancialReportDto {
    private LocalDate reportDate;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    
    // Общая экономия
    private BigDecimal totalSavings;
    private BigDecimal savingsPercentage;
    private BigDecimal averageSavingsPerTender;
    private BigDecimal totalBudget;
    private BigDecimal spentBudget;
    private BigDecimal remainingBudget;
    private BigDecimal budgetUtilization;
    
    // Анализ по тендерам
    private Integer totalTenders;
    private Integer completedTenders;
    private Integer activeTenders;
    private BigDecimal totalTenderValue;
    private BigDecimal averageTenderValue;
    private BigDecimal totalContractValue;
    
    // Анализ по контрактам
    private Integer totalContracts;
    private Integer activeContracts;
    private Integer completedContracts;
    private BigDecimal totalContractAmount;
    private BigDecimal averageContractAmount;
    
    // Анализ по поставкам
    private Integer totalDeliveries;
    private Integer completedDeliveries;
    private Integer pendingDeliveries;
    private BigDecimal totalDeliveryValue;
    
    // Анализ по платежам
    private BigDecimal totalPayments;
    private BigDecimal paidPayments;
    private BigDecimal pendingPayments;
    private BigDecimal overduePayments;
    private BigDecimal paymentEfficiency;
    
    // Анализ задолженности
    private BigDecimal totalDebt;
    private BigDecimal supplierDebt;
    private BigDecimal customerDebt;
    private Integer overdueDays;
    private List<DebtItemDto> debtItems;
    
    // Анализ по поставщикам
    private Integer activeSuppliers;
    private BigDecimal averageSupplierRating;
    private BigDecimal totalSupplierValue;
    
    // Прогнозы
    private BigDecimal expectedSavings;
    private BigDecimal expectedExpenses;
    private BigDecimal cashFlowForecast;
    
    // Тренды
    private String savingsTrend; // UP, DOWN, STABLE
    private String budgetTrend;
    private String paymentTrend;
    
    @Data
    public static class DebtItemDto {
        private UUID contractId;
        private String contractNumber;
        private String supplierName;
        private BigDecimal contractAmount;
        private BigDecimal paidAmount;
        private BigDecimal debtAmount;
        private LocalDate dueDate;
        private Integer daysOverdue;
        private String status;
    }
} 