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
@Table(name = "tenders")
@Getter
@Setter
@ToString(exclude = "tenderItems")
@NoArgsConstructor
public class Tender {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private Request request;

    private String tenderNumber;

    private String title;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Company customer;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private LocalDateTime submissionDeadline;

    @Enumerated(EnumType.STRING)
    private TenderStatus status = TenderStatus.DRAFT;

    private String requirements;

    private String termsAndConditions;

    @OneToMany(mappedBy = "tender", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TenderItem> tenderItems = new ArrayList<>();

    @OneToMany(mappedBy = "tender", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SupplierProposal> supplierProposals = new ArrayList<>();

    public enum TenderStatus {
        DRAFT,           // Черновик
        PUBLISHED,       // Опубликован
        BIDDING,         // Прием предложений
        EVALUATION,      // Оценка предложений
        AWARDED,         // Присужден
        CANCELLED        // Отменен
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Tender tender = (Tender) o;
        return id != null && id.equals(tender.id);
    }

    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }
} 