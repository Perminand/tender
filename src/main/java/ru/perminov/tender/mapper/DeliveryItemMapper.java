package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.perminov.tender.dto.delivery.DeliveryItemDto;
import ru.perminov.tender.model.DeliveryItem;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DeliveryItemMapper {
    
    /**
     * Преобразовать модель в DTO
     */
    @Mapping(target = "deliveryId", source = "delivery.id")
    @Mapping(target = "contractItemId", source = "contractItem.id")
    @Mapping(target = "materialId", source = "material.id")
    @Mapping(target = "materialName", source = "material.name")
    @Mapping(target = "unitId", source = "unit.id")
    @Mapping(target = "unitName", source = "unit.name")
    @Mapping(target = "acceptanceStatus", source = "acceptanceStatus")
    DeliveryItemDto toDto(DeliveryItem deliveryItem);
    
    /**
     * Преобразовать список моделей в список DTO
     */
    List<DeliveryItemDto> toDtoList(List<DeliveryItem> deliveryItems);
} 