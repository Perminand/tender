package ru.perminov.tender.dto.dashboard;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class DashboardDto {
    private LocalDate dashboardDate;
    
    // Ключевые метрики
    private DashboardMetricsDto metrics;
    
    // Активные тендеры
    private List<ActiveTenderDto> activeTenders;
    
    // Срочные поставки
    private List<UrgentDeliveryDto> urgentDeliveries;
    
    // Просроченные платежи
    private List<OverduePaymentDto> overduePayments;
    
    // Топ поставщики
    private List<TopSupplierDto> topSuppliers;
    
    // Проблемные поставщики
    private List<ProblematicSupplierDto> problematicSuppliers;
    
    // Последние активности
    private List<RecentActivityDto> recentActivities;
    
    // Графики и диаграммы
    private ChartDataDto savingsChart;
    private ChartDataDto deliveryChart;
    private ChartDataDto qualityChart;
    private ChartDataDto budgetChart;
    
    // Алерты и уведомления
    private List<AlertSummaryDto> alerts;
    private Integer unreadAlertsCount;
    private Integer urgentAlertsCount;
    
    // Быстрые действия
    private List<QuickActionDto> quickActions;
    
    @Data
    public static class DashboardMetricsDto {
        private Integer totalTenders;
        private Integer activeTenders;
        private Integer completedTenders;
        private BigDecimal totalSavings;
        private BigDecimal savingsPercentage;
        private Integer totalDeliveries;
        private Integer pendingDeliveries;
        private Integer overdueDeliveries;
        private BigDecimal qualityAcceptanceRate;
        private Integer activeSuppliers;
        private BigDecimal averageSupplierRating;
        private BigDecimal totalBudget;
        private BigDecimal spentBudget;
        private BigDecimal remainingBudget;
        private BigDecimal budgetUtilization;
        private Integer totalContracts;
        private Integer activeContracts;
        private Integer totalPayments;
        private Integer overduePayments;
    }
    
    @Data
    public static class ActiveTenderDto {
        private UUID id;
        private String tenderNumber;
        private String title;
        private String status;
        private LocalDate deadline;
        private Integer daysRemaining;
        private Integer proposalsCount;
        private BigDecimal estimatedValue;
        private BigDecimal bestOffer;
        private BigDecimal potentialSavings;
    }
    
    @Data
    public static class UrgentDeliveryDto {
        private UUID id;
        private String deliveryNumber;
        private String supplierName;
        private String contractNumber;
        private LocalDate plannedDate;
        private LocalDate dueDate;
        private Integer daysOverdue;
        private String status;
        private BigDecimal totalValue;
    }
    
    @Data
    public static class OverduePaymentDto {
        private UUID id;
        private String paymentNumber;
        private String supplierName;
        private String contractNumber;
        private LocalDate dueDate;
        private Integer daysOverdue;
        private BigDecimal amount;
        private String status;
    }
    
    @Data
    public static class TopSupplierDto {
        private UUID id;
        private String name;
        private BigDecimal rating;
        private Integer totalContracts;
        private BigDecimal totalValue;
        private BigDecimal averageSavings;
        private Integer onTimeDeliveries;
        private Integer totalDeliveries;
        private BigDecimal performanceScore;
    }
    
    @Data
    public static class ProblematicSupplierDto {
        private UUID id;
        private String name;
        private BigDecimal rating;
        private Integer qualityIssues;
        private Integer delayedDeliveries;
        private BigDecimal riskScore;
        private String riskLevel;
        private String recommendations;
    }
    
    @Data
    public static class RecentActivityDto {
        private UUID id;
        private String type;
        private String description;
        private LocalDate activityDate;
        private String status;
        private String entityType;
        private UUID entityId;
    }
    
    @Data
    public static class ChartDataDto {
        private String title;
        private String type; // LINE, BAR, PIE, DONUT
        private List<ChartPointDto> data;
        private String xAxisLabel;
        private String yAxisLabel;
    }
    
    @Data
    public static class ChartPointDto {
        private String label;
        private BigDecimal value;
        private String color;
    }
    
    @Data
    public static class AlertSummaryDto {
        private UUID id;
        private String title;
        private String type;
        private String severity;
        private Boolean isRead;
        private LocalDate createdAt;
        private String actionUrl;
    }
    
    @Data
    public static class QuickActionDto {
        private String title;
        private String description;
        private String icon;
        private String actionUrl;
        private String color;
        private Boolean isEnabled;
    }
} 