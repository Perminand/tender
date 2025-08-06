package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import ru.perminov.tender.dto.UnitDto;
import ru.perminov.tender.dto.UnitDtoNew;
import ru.perminov.tender.dto.UnitDtoUpdate;
import ru.perminov.tender.model.Unit;

@Mapper(componentModel = "spring")
public interface UnitMapper {
    Unit toUnit(UnitDtoNew dto);
    
    @Named("toUnitDto")
    UnitDto toUnitDto(Unit unit);
    
    Unit toEntity(UnitDto dto);
    
    void updateUnitFromDto(UnitDtoUpdate dto, @MappingTarget Unit unit);
} 