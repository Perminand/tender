package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import ru.perminov.tender.dto.dictionary.DeliveryTypeDto;
import ru.perminov.tender.model.DeliveryType;

@Mapper(componentModel = "spring")
public interface DeliveryTypeMapper {
    DeliveryTypeDto toDto(DeliveryType entity);
    DeliveryType toEntity(DeliveryTypeDto dto);
}


