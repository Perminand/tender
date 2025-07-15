package ru.perminov.tender.dto.delivery;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class DeliveryDtoNew {
    private String deliveryNumber;
    private UUID contractId;
    private UUID supplierId;
    private UUID warehouseId;
    private LocalDate plannedDate;
    private String trackingNumber;
    private String notes;
    private List<DeliveryItemDto> deliveryItems;
} 