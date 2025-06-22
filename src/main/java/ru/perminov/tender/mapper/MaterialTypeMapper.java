package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.MaterialTypeDto;
import ru.perminov.tender.dto.MaterialTypeDtoNew;
import ru.perminov.tender.dto.MaterialTypeDtoUpdate;
import ru.perminov.tender.model.MaterialType;

@Mapper(componentModel = "spring")
public interface MaterialTypeMapper {
    MaterialType toMaterialType(MaterialTypeDtoNew dto);
    MaterialTypeDto toMaterialTypeDto(MaterialType materialType);
    void updateMaterialTypeFromDto(MaterialTypeDtoUpdate dto, @MappingTarget MaterialType materialType);
} 