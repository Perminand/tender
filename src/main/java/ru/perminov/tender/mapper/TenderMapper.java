package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import ru.perminov.tender.dto.tender.TenderDto;
import ru.perminov.tender.model.Tender;

@Mapper(componentModel = "spring")
public interface TenderMapper {
    TenderMapper INSTANCE = Mappers.getMapper(TenderMapper.class);

    @Mapping(target = "awardedSupplierId", source = "awardedSupplierId")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.name")
    @Mapping(target = "requestId", source = "request.id")
    @Mapping(target = "parentTenderId", source = "parentTender.id")
    TenderDto toDto(Tender entity);
    
    Tender toEntity(TenderDto dto);
} 