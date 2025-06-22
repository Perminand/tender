package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.UnitDto;
import ru.perminov.tender.dto.UnitDtoNew;
import ru.perminov.tender.dto.UnitDtoUpdate;
import ru.perminov.tender.model.Unit;

@Mapper(componentModel = "spring")
public interface UnitMapper {
    Unit toUnit(UnitDtoNew dto);
    UnitDto toUnitDto(Unit unit);
    void updateUnitFromDto(UnitDtoUpdate dto, @MappingTarget Unit unit);
} 