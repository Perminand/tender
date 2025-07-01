package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Named;
import ru.perminov.tender.dto.CharacteristicDto;
import ru.perminov.tender.model.Characteristic;

@Mapper(componentModel = "spring")
public interface CharacteristicMapper {
    
    @Named("toCharacteristicDto")
    CharacteristicDto toDto(Characteristic entity);

    Characteristic toEntity(CharacteristicDto dto);
} 