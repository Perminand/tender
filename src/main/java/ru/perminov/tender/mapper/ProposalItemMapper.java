package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import ru.perminov.tender.dto.tender.ProposalItemDto;
import ru.perminov.tender.model.ProposalItem;
import ru.perminov.tender.mapper.BrandMapper;
import ru.perminov.tender.mapper.ManufacturerMapper;
import ru.perminov.tender.mapper.CountryMapper;
import ru.perminov.tender.mapper.WarrantyMapper;

@Mapper(componentModel = "spring", uses = {BrandMapper.class, ManufacturerMapper.class, CountryMapper.class, WarrantyMapper.class})
public interface ProposalItemMapper {
    ProposalItemMapper INSTANCE = Mappers.getMapper(ProposalItemMapper.class);

    @Mapping(target = "unitId", source = "unit.id")
    @Mapping(target = "unitName", source = "unit.name")
    @Mapping(target = "supplierProposalId", source = "supplierProposal.id")
    @Mapping(target = "tenderItemId", source = "tenderItem.id")
    ProposalItemDto toDto(ProposalItem entity);
    
    @Mapping(target = "unit", ignore = true) // Игнорируем unit при маппинге DTO в сущность
    @Mapping(target = "supplierProposal", ignore = true)
    @Mapping(target = "tenderItem", ignore = true)
    ProposalItem toEntity(ProposalItemDto dto);
} 