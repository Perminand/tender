package ru.perminov.tender.dto.delivery;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DeliveryDto {
    private UUID id;
    private String deliveryNumber;
    private UUID contractId;
    private UUID supplierId;
    private UUID warehouseId;
    private String status;
    private LocalDate plannedDate;
    private LocalDate actualDate;
    private String trackingNumber;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 