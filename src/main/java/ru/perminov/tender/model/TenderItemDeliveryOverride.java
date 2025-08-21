package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "tender_item_delivery_overrides")
@Getter
@Setter
@NoArgsConstructor
public class TenderItemDeliveryOverride {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tender_item_id", nullable = false)
    private UUID tenderItemId;

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
}


