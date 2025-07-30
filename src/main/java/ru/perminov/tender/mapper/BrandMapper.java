package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.perminov.tender.dto.dictionary.BrandDto;
import ru.perminov.tender.model.Brand;

@Mapper(componentModel = "spring")
public interface BrandMapper {
    
    BrandDto toDto(Brand brand);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Brand toEntity(BrandDto brandDto);
} 