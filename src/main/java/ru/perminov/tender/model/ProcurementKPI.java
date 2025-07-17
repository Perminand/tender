package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "procurement_kpis")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class ProcurementKPI {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String kpiName;

    private String description;

    private LocalDate measurementDate;

    private LocalDate periodStart;

    private LocalDate periodEnd;

    // KPI по экономии
    private BigDecimal totalSavings;
    private BigDecimal savingsPercentage;
    private BigDecimal averageSavingsPerTender;
    private BigDecimal budgetUtilization;

    // KPI по времени
    private Integer averageTenderDuration; // дни
    private Integer averageRequestProcessingTime; // часы
    private Integer averageDeliveryTime; // дни
    private Integer onTimeDeliveryPercentage;

    // KPI по качеству
    private Integer totalDeliveries;
    private Integer acceptedDeliveries;
    private Integer rejectedDeliveries;
    private BigDecimal qualityAcceptanceRate;

    // KPI по поставщикам
    private Integer activeSuppliers;
    private Integer newSuppliers;
    private BigDecimal averageSupplierRating;
    private Integer supplierRetentionRate;

    // KPI по тендерам
    private Integer totalTenders;
    private Integer successfulTenders;
    private Integer cancelledTenders;
    private BigDecimal tenderSuccessRate;
    private Integer averageProposalsPerTender;

    // KPI по контрактам
    private Integer totalContracts;
    private Integer activeContracts;
    private Integer completedContracts;
    private BigDecimal contractValue;
    private BigDecimal averageContractValue;

    // KPI по платежам
    private BigDecimal totalPayments;
    private BigDecimal pendingPayments;
    private BigDecimal overduePayments;
    private BigDecimal paymentEfficiency;

    // Целевые значения
    private BigDecimal targetSavings;
    private Integer targetTenderDuration;
    private BigDecimal targetQualityRate;
    private Integer targetSupplierCount;

    // Статус выполнения
    @Enumerated(EnumType.STRING)
    private KPIStatus status = KPIStatus.ACTIVE;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum KPIStatus {
        ACTIVE,         // Активный
        ACHIEVED,       // Достигнут
        EXCEEDED,       // Превышен
        MISSED,         // Не достигнут
        ARCHIVED        // Архивирован
    }

    // Методы для расчета KPI
    public void calculateQualityAcceptanceRate() {
        if (totalDeliveries != null && totalDeliveries > 0 && acceptedDeliveries != null) {
            this.qualityAcceptanceRate = BigDecimal.valueOf(acceptedDeliveries)
                    .divide(BigDecimal.valueOf(totalDeliveries), 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
    }

    public void calculateTenderSuccessRate() {
        if (totalTenders != null && totalTenders > 0 && successfulTenders != null) {
            this.tenderSuccessRate = BigDecimal.valueOf(successfulTenders)
                    .divide(BigDecimal.valueOf(totalTenders), 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
    }

    public void calculatePaymentEfficiency() {
        if (totalPayments != null && totalPayments.compareTo(BigDecimal.ZERO) > 0 && 
            pendingPayments != null) {
            BigDecimal paidAmount = totalPayments.subtract(pendingPayments);
            this.paymentEfficiency = paidAmount
                    .divide(totalPayments, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
    }

    // Метод для оценки выполнения KPI
    public KPIStatus evaluateKPIStatus() {
        if (targetSavings != null && totalSavings != null && 
            totalSavings.compareTo(targetSavings) >= 0) {
            return KPIStatus.ACHIEVED;
        }
        return KPIStatus.MISSED;
    }
} 