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
@Table(name = "contracts")
@Getter
@Setter
@ToString(exclude = "contractItems")
@NoArgsConstructor
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tender_id")
    private Tender tender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_proposal_id")
    private SupplierProposal supplierProposal;

    private String contractNumber;

    private String title;

    private LocalDate contractDate;

    private LocalDate startDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private ContractStatus status = ContractStatus.DRAFT;

    private BigDecimal totalAmount;

    private String currency = "RUB";

    private String paymentTerms;

    private String deliveryTerms;

    private String warrantyTerms;

    private String specialConditions;

    private String terms;

    private String description;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContractItem> contractItems = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum ContractStatus {
        DRAFT,           // Черновик
        ACTIVE,          // Активный
        COMPLETED,       // Завершен
        TERMINATED,      // Расторгнут
        SUSPENDED        // Приостановлен
    }
} 