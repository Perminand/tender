package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import ru.perminov.tender.dto.tender.TenderItemDto;
import ru.perminov.tender.model.TenderItem;

@Mapper(componentModel = "spring")
public interface TenderItemMapper {
    TenderItemMapper INSTANCE = Mappers.getMapper(TenderItemMapper.class);

    @Mapping(target = "tenderId", source = "tender.id")
    @Mapping(target = "requestMaterialId", source = "requestMaterial.id")
    @Mapping(target = "materialId", source = "requestMaterial.material.id")
    @Mapping(target = "materialName", source = "requestMaterial.material.name")
    @Mapping(target = "materialTypeName", source = "requestMaterial.material.materialType.name")
    @Mapping(target = "unitId", source = "unit.id")
    @Mapping(target = "unitName", source = "unit.shortName")
    TenderItemDto toDto(TenderItem entity);
    
    TenderItem toEntity(TenderItemDto dto);
} 