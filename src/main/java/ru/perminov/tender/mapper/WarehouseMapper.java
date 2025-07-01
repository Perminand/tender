package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.perminov.tender.dto.WarehouseDto;
import ru.perminov.tender.model.Warehouse;

@Mapper(componentModel = "spring")
public interface WarehouseMapper {

    @Mapping(source = "project.id", target = "projectId")
    WarehouseDto toDto(Warehouse warehouse);
    
    @Mapping(source = "projectId", target = "project.id")
    Warehouse toEntity(WarehouseDto dto);
} 