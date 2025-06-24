package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import ru.perminov.tender.dto.RequestMaterialDto;
import ru.perminov.tender.model.RequestMaterial;
 
@Mapper(componentModel = "spring", uses = {MaterialMapper.class, UnitMapper.class})
public interface RequestMaterialMapper {
    RequestMaterialDto toDto(RequestMaterial entity);
    RequestMaterial toEntity(RequestMaterialDto dto);
} 