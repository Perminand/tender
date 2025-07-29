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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@ToString(exclude = "invoiceItems")
@NoArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Company supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private Request request;

    private String invoiceNumber;

    private LocalDate invoiceDate;

    private LocalDate dueDate;

    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    private BigDecimal totalAmount;

    private BigDecimal paidAmount = BigDecimal.ZERO;

    private BigDecimal vatAmount;

    private String currency = "RUB";

    private String paymentTerms;

    private String notes;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> invoiceItems = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum InvoiceStatus {
        DRAFT,           // Черновик
        SENT,            // Отправлен
        CONFIRMED,       // Подтвержден
        PARTIALLY_PAID,  // Частично оплачен
        PAID,            // Оплачен
        OVERDUE,         // Просрочен
        CANCELLED        // Отменен
    }

    public BigDecimal getRemainingAmount() {
        return totalAmount != null ? totalAmount.subtract(paidAmount != null ? paidAmount : BigDecimal.ZERO) : BigDecimal.ZERO;
    }

    public boolean isFullyPaid() {
        return totalAmount != null && paidAmount != null && paidAmount.compareTo(totalAmount) >= 0;
    }
} 