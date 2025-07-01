package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import ru.perminov.tender.dto.material.MaterialDto;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.model.SupplierMaterialName;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(
        componentModel = "spring",
        uses = {CategoryMapper.class, MaterialTypeMapper.class, UnitMapper.class, CharacteristicMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface MaterialMapper {
    
    @Named("toMaterialDto")
    MaterialDto toDto(Material entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "materialType", ignore = true)
    @Mapping(target = "units", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Material toEntity(MaterialDtoNew dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "materialType", ignore = true)
    @Mapping(target = "units", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(MaterialDtoUpdate dto, @MappingTarget Material entity);

} 