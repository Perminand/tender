package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import ru.perminov.tender.dto.WarehouseDto;
import ru.perminov.tender.model.Warehouse;
 
@Mapper(componentModel = "spring")
public interface WarehouseMapper {
    WarehouseDto toDto(Warehouse warehouse);
    Warehouse toEntity(WarehouseDto dto);
} 