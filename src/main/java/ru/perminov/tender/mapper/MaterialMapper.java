package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
import ru.perminov.tender.model.Material;

@Mapper(componentModel = "spring")
public interface MaterialMapper {
    
    @Mapping(target = "category", ignore = true)
    Material toMaterial(MaterialDtoNew dto);
    
    @Mapping(target = "category", ignore = true)
    void updateMaterialFromDto(MaterialDtoUpdate dto, @MappingTarget Material material);
} 