package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.perminov.tender.dto.dictionary.CountryDto;
import ru.perminov.tender.model.Country;

@Mapper(componentModel = "spring")
public interface CountryMapper {
    
    CountryDto toDto(Country country);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Country toEntity(CountryDto countryDto);
} 