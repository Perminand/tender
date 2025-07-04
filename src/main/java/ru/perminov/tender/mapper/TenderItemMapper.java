package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import ru.perminov.tender.dto.tender.TenderItemDto;
import ru.perminov.tender.model.TenderItem;

@Mapper(componentModel = "spring")
public interface TenderItemMapper {
    TenderItemMapper INSTANCE = Mappers.getMapper(TenderItemMapper.class);

    @Mapping(target = "unitId", source = "unit.id")
    @Mapping(target = "unitName", source = "unit.name")
    @Mapping(target = "tenderId", source = "tender.id")
    @Mapping(target = "requestMaterialId", source = "requestMaterial.id")
    TenderItemDto toDto(TenderItem entity);
    
    TenderItem toEntity(TenderItemDto dto);
} 