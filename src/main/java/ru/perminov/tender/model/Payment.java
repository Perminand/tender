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
@Table(name = "payments")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class Payment {

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
    @JoinColumn(name = "customer_id")
    private Company customer;

    private String paymentNumber;

    private LocalDate paymentDate;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private PaymentType type;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    private BigDecimal amount;

    private String currency = "RUB";

    private BigDecimal vatAmount;

    private BigDecimal totalAmount;

    private String paymentMethod;

    private String bankAccount;

    private String invoiceNumber;

    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum PaymentType {
        ADVANCE,        // Аванс
        PROGRESS,       // Прогрессный платеж
        FINAL,          // Финальный платеж
        PENALTY,        // Штраф
        COMPENSATION    // Компенсация
    }

    public enum PaymentStatus {
        PENDING,        // Ожидает оплаты
        APPROVED,       // Одобрен
        PAID,           // Оплачен
        OVERDUE,        // Просрочен
        CANCELLED       // Отменен
    }
} 