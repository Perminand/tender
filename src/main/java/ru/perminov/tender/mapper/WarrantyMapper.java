package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.perminov.tender.dto.dictionary.WarrantyDto;
import ru.perminov.tender.model.Warranty;

@Mapper(componentModel = "spring")
public interface WarrantyMapper {
    
    WarrantyDto toDto(Warranty warranty);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Warranty toEntity(WarrantyDto warrantyDto);
} 