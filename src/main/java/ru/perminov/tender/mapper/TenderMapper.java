package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import ru.perminov.tender.dto.tender.TenderDto;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.mapper.company.CompanyMapper;

@Mapper(componentModel = "spring", uses = {CompanyMapper.class})
public interface TenderMapper {
    TenderMapper INSTANCE = Mappers.getMapper(TenderMapper.class);

    @Mapping(target = "awardedSupplierId", source = "awardedSupplierId")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.name")
    @Mapping(target = "customer", source = "customer")
    @Mapping(target = "awardedSupplier", ignore = true) // Будет заполняться вручную в сервисе
    @Mapping(target = "requestId", source = "request.id")
    @Mapping(target = "parentTenderId", source = "parentTender.id")
    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.name")
    TenderDto toDto(Tender entity);
    
    Tender toEntity(TenderDto dto);
} 