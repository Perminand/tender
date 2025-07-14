package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import ru.perminov.tender.dto.contract.ContractItemDto;
import ru.perminov.tender.model.ContractItem;

@Mapper(componentModel = "spring")
public interface ContractItemMapper {
    
    ContractItemMapper INSTANCE = Mappers.getMapper(ContractItemMapper.class);

    @Mapping(target = "contractId", source = "contract.id")
    @Mapping(target = "materialId", source = "material.id")
    @Mapping(target = "materialName", source = "material.name")
    @Mapping(target = "unitName", source = "unit.name")
    ContractItemDto toDto(ContractItem entity);
    
    ContractItem toEntity(ContractItemDto dto);
} 