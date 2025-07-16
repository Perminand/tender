package ru.perminov.tender.dto.delivery;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Data
public class DeliveryDto {
    private UUID id;
    private String deliveryNumber;
    private UUID contractId;
    private String contractNumber; // Номер контракта
    private String contractTitle;  // Название контракта
    private UUID supplierId;
    private String supplierName;   // Название поставщика
    private UUID warehouseId;
    private String warehouseName;  // Название склада
    private String status;
    private LocalDate plannedDate;
    private LocalDate actualDate;
    private String trackingNumber;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<DeliveryItemDto> deliveryItems;
} 