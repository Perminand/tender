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
    @Mapping(target = "supplierName", expression = "java(entity.getSupplier() != null ? (entity.getSupplier().getShortName() != null && !entity.getSupplier().getShortName().isEmpty() ? entity.getSupplier().getShortName() : (entity.getSupplier().getLegalName() != null && !entity.getSupplier().getLegalName().isEmpty() ? entity.getSupplier().getLegalName() : entity.getSupplier().getName())) : null)")
    @Mapping(target = "tenderId", source = "tender.id")
    @Mapping(target = "tenderNumber", source = "tender.tenderNumber")
    @Mapping(target = "tenderTitle", source = "tender.title")
    @Mapping(target = "proposalItems", ignore = true)
    @Mapping(target = "additionalExpenses", ignore = true)
    @Mapping(target = "isBestOffer", ignore = true)
    @Mapping(target = "paymentConditionId", ignore = true)
    @Mapping(target = "priceDifference", ignore = true)
    SupplierProposalDto toDto(SupplierProposal entity);

    @Mapping(target = "paymentCondition", ignore = true)
    @Mapping(target = "proposalItems", ignore = true)
    @Mapping(target = "additionalExpenses", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "tender", ignore = true)
    SupplierProposal toEntity(SupplierProposalDto dto);
} 