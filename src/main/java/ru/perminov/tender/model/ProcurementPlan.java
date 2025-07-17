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
@Table(name = "procurement_plans")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class ProcurementPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String planNumber;

    private String title;

    private String description;

    private LocalDate planYear;

    private LocalDate startDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private PlanStatus status = PlanStatus.DRAFT;

    // Бюджетные показатели
    private BigDecimal totalBudget;
    private BigDecimal allocatedBudget;
    private BigDecimal spentBudget;
    private BigDecimal remainingBudget;

    // Планируемые закупки
    private Integer plannedTenders;
    private Integer completedTenders;
    private Integer activeTenders;

    // Прогнозы
    private BigDecimal expectedSavings;
    private BigDecimal averageTenderValue;
    private Integer expectedSuppliers;

    // Приоритеты
    private String priorityCategories;
    private String criticalItems;
    private String seasonalItems;

    // Метаданные
    private String createdBy;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum PlanStatus {
        DRAFT,          // Черновик
        APPROVED,       // Утвержден
        ACTIVE,         // Активный
        COMPLETED,      // Завершен
        CANCELLED       // Отменен
    }

    // Метод для расчета оставшегося бюджета
    public void calculateRemainingBudget() {
        if (totalBudget != null && spentBudget != null) {
            this.remainingBudget = totalBudget.subtract(spentBudget);
        }
    }

    // Метод для расчета процента выполнения
    public BigDecimal getCompletionPercentage() {
        if (totalBudget != null && totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            return spentBudget.divide(totalBudget, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }
} 