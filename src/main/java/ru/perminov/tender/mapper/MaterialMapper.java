package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
import ru.perminov.tender.model.Material;

@Mapper(componentModel = "spring")
public interface MaterialMapper {
    Material toMaterial(MaterialDtoNew dto);
    void updateMaterialFromDto(MaterialDtoUpdate dto, @MappingTarget Material material);
} 