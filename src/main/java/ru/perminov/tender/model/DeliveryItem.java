package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "delivery_items")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class DeliveryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_item_id")
    private ContractItem contractItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id")
    private Material material;

    private Integer itemNumber;

    private String description;

    private BigDecimal orderedQuantity;

    private BigDecimal deliveredQuantity;

    private BigDecimal acceptedQuantity;

    private BigDecimal rejectedQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private String qualityNotes;

    private String rejectionReason;

    @Enumerated(EnumType.STRING)
    private AcceptanceStatus acceptanceStatus = AcceptanceStatus.PENDING;

    public enum AcceptanceStatus {
        PENDING,        // Ожидает приемки
        ACCEPTED,       // Принято
        REJECTED,       // Отклонено
        PARTIALLY_ACCEPTED // Частично принято
    }
} 