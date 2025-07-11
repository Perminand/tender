package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import ru.perminov.tender.model.company.Company;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "supplier_proposals")
@Getter
@Setter
@ToString(exclude = "proposalItems")
@NoArgsConstructor
public class SupplierProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tender_id")
    private Tender tender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Company supplier;

    private String proposalNumber;

    @Column(nullable = false)
    private LocalDateTime submissionDate = LocalDateTime.now();

    private LocalDateTime validUntil;

    @Enumerated(EnumType.STRING)
    private ProposalStatus status = ProposalStatus.SUBMITTED;

    private String coverLetter;

    private String technicalProposal;

    private String commercialTerms;

    private Double totalPrice;

    private String currency = "RUB";

    private String paymentTerms;

    private String deliveryTerms;

    private String warrantyTerms;

    @OneToMany(mappedBy = "supplierProposal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProposalItem> proposalItems = new ArrayList<>();

    public enum ProposalStatus {
        DRAFT,          // Черновик
        SUBMITTED,      // Подано
        UNDER_REVIEW,   // На рассмотрении
        ACCEPTED,       // Принято
        REJECTED,       // Отклонено
        WITHDRAWN       // Отозвано
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SupplierProposal that = (SupplierProposal) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }
} 