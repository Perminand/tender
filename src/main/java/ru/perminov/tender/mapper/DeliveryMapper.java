package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.delivery.DeliveryDto;
import ru.perminov.tender.dto.delivery.DeliveryDtoNew;
import ru.perminov.tender.model.Delivery;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DeliveryMapper {
    
    /**
     * Преобразовать модель в DTO
     */
    @Mapping(target = "contractId", source = "contract.id")
    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "plannedDate", source = "plannedDeliveryDate")
    DeliveryDto toDto(Delivery delivery);
    
    /**
     * Преобразовать список моделей в список DTO
     */
    List<DeliveryDto> toDtoList(List<Delivery> deliveries);
    
    /**
     * Преобразовать DTO для создания в модель
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "actualDate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "contract", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "deliveryItems", ignore = true)
    @Mapping(target = "plannedDeliveryDate", source = "plannedDate")
    Delivery toEntity(DeliveryDtoNew deliveryDtoNew);
    
    /**
     * Обновить модель из DTO для создания
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "actualDate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "contract", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "deliveryItems", ignore = true)
    @Mapping(target = "plannedDeliveryDate", source = "plannedDate")
    void updateEntity(@MappingTarget Delivery delivery, DeliveryDtoNew deliveryDtoNew);
} 