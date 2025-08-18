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
@Table(name = "additional_expenses")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class AdditionalExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_proposal_id", nullable = false)
    private SupplierProposal supplierProposal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_provider_id")
    private Company expenseProvider;

    @Column(nullable = false)
    private String expenseType;

    @Column(nullable = false)
    private String description;

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    private String currency = "RUB";

    private String invoiceNumber;

    private LocalDate invoiceDate;

    private String documentPath;

    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseStatus status = ExpenseStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum ExpenseStatus {
        PENDING("Ожидает подтверждения"),
        APPROVED("Подтвержден"),
        REJECTED("Отклонен"),
        PAID("Оплачен");

        private final String displayName;

        ExpenseStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AdditionalExpense that = (AdditionalExpense) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }
}
