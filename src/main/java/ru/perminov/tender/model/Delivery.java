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
@Table(name = "deliveries")
@Getter
@Setter
@ToString(exclude = "deliveryItems")
@NoArgsConstructor
public class Delivery {

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
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    private String deliveryNumber;

    private LocalDate deliveryDate;

    private LocalDate plannedDeliveryDate;

    private LocalDate actualDate;

    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status = DeliveryStatus.PLANNED;

    private String transportInfo;

    private String driverInfo;

    private String vehicleNumber;

    private String notes;

    @OneToMany(mappedBy = "delivery", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DeliveryItem> deliveryItems = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum DeliveryStatus {
        PLANNED,           // Запланирована
        CONFIRMED,         // Подтверждена поставщиком
        IN_TRANSIT,        // В пути
        ARRIVED,           // Прибыла на склад
        DELIVERED,         // Доставлена
        ACCEPTED,          // Принята
        REJECTED,          // Отклонена
        PARTIALLY_ACCEPTED, // Частично принята
        CANCELLED          // Отменена
    }
} 