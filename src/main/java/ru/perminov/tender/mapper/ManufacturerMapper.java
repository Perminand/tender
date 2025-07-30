package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.perminov.tender.dto.dictionary.ManufacturerDto;
import ru.perminov.tender.model.Manufacturer;

@Mapper(componentModel = "spring")
public interface ManufacturerMapper {
    
    ManufacturerDto toDto(Manufacturer manufacturer);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Manufacturer toEntity(ManufacturerDto manufacturerDto);
} 