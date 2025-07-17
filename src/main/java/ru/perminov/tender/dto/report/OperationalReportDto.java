package ru.perminov.tender.dto.report;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class OperationalReportDto {
    private LocalDate reportDate;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    
    // KPI по времени
    private Integer averageTenderDuration; // дни
    private Integer averageRequestProcessingTime; // часы
    private Integer averageDeliveryTime; // дни
    private Integer onTimeDeliveryPercentage;
    private Integer delayedDeliveries;
    private Integer totalDeliveries;
    
    // KPI по качеству
    private Integer totalDeliveriesCount;
    private Integer acceptedDeliveries;
    private Integer rejectedDeliveries;
    private Integer partiallyAcceptedDeliveries;
    private BigDecimal qualityAcceptanceRate;
    private Integer qualityIssues;
    private List<QualityIssueDto> qualityIssuesList;
    
    // KPI по эффективности
    private Integer totalRequests;
    private Integer processedRequests;
    private Integer pendingRequests;
    private BigDecimal requestProcessingEfficiency;
    private Integer totalTenders;
    private Integer successfulTenders;
    private BigDecimal tenderSuccessRate;
    
    // KPI по поставщикам
    private Integer activeSuppliers;
    private Integer newSuppliers;
    private BigDecimal averageSupplierRating;
    private Integer supplierRetentionRate;
    private List<SupplierPerformanceDto> topSuppliers;
    private List<SupplierPerformanceDto> problematicSuppliers;
    
    // Анализ по материалам
    private List<MaterialPerformanceDto> topMaterials;
    private List<MaterialPerformanceDto> problematicMaterials;
    
    // Анализ по категориям
    private List<CategoryPerformanceDto> categoryPerformance;
    
    // Тренды
    private String deliveryTrend; // IMPROVING, STABLE, DECLINING
    private String qualityTrend;
    private String efficiencyTrend;
    
    // Рекомендации
    private List<String> recommendations;
    private List<String> alerts;
    
    @Data
    public static class QualityIssueDto {
        private UUID deliveryId;
        private String deliveryNumber;
        private String supplierName;
        private String materialName;
        private String issueType;
        private String description;
        private LocalDate issueDate;
        private String resolution;
    }
    
    @Data
    public static class SupplierPerformanceDto {
        private UUID supplierId;
        private String supplierName;
        private BigDecimal rating;
        private Integer totalDeliveries;
        private Integer onTimeDeliveries;
        private Integer qualityIssues;
        private BigDecimal performanceScore;
        private String status;
    }
    
    @Data
    public static class MaterialPerformanceDto {
        private UUID materialId;
        private String materialName;
        private String categoryName;
        private Integer totalOrders;
        private BigDecimal averagePrice;
        private Integer qualityIssues;
        private BigDecimal availabilityRate;
        private String status;
    }
    
    @Data
    public static class CategoryPerformanceDto {
        private UUID categoryId;
        private String categoryName;
        private Integer totalItems;
        private BigDecimal totalValue;
        private BigDecimal averageSavings;
        private Integer activeSuppliers;
        private BigDecimal performanceScore;
    }
} 