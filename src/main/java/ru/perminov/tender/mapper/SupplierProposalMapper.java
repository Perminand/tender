package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.model.SupplierProposal;

@Mapper(componentModel = "spring")
public interface SupplierProposalMapper {
    
    SupplierProposalMapper INSTANCE = Mappers.getMapper(SupplierProposalMapper.class);

    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "supplierName", source = "supplier.name")
    @Mapping(target = "tenderId", source = "tender.id")
    SupplierProposalDto toDto(SupplierProposal entity);

    SupplierProposal toEntity(SupplierProposalDto dto);
} 