package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.perminov.tender.model.company.Company;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tender_item_notes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tender_item_id", "supplier_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class TenderItemNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tender_item_id", nullable = false)
    private TenderItem tenderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Company supplier;

    @Column(name = "note", nullable = false, columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}


