package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import ru.perminov.tender.model.company.Company;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "budgets")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    private String budgetNumber;

    private LocalDate budgetYear;

    private LocalDate startDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private BudgetStatus status = BudgetStatus.DRAFT;

    private BigDecimal totalBudget;

    private BigDecimal allocatedBudget;

    private BigDecimal spentBudget;

    private BigDecimal remainingBudget;

    private String currency = "RUB";

    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum BudgetStatus {
        DRAFT,          // Черновик
        APPROVED,       // Утвержден
        ACTIVE,         // Активный
        CLOSED,         // Закрыт
        CANCELLED       // Отменен
    }
} 