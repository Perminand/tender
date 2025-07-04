package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.UUID;

@Entity
@Table(name = "proposal_items")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class ProposalItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_proposal_id")
    private SupplierProposal supplierProposal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tender_item_id")
    private TenderItem tenderItem;

    private Integer itemNumber;

    private String description;

    private String brand;

    private String model;

    private String manufacturer;

    private String countryOfOrigin;

    private Double quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;

    private Double unitPrice;

    private Double totalPrice;

    private String specifications;

    private String deliveryPeriod;

    private String warranty;

    private String additionalInfo;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProposalItem that = (ProposalItem) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }
} 