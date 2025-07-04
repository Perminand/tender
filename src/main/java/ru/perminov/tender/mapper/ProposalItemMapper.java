package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import ru.perminov.tender.dto.tender.ProposalItemDto;
import ru.perminov.tender.model.ProposalItem;

@Mapper(componentModel = "spring")
public interface ProposalItemMapper {
    ProposalItemMapper INSTANCE = Mappers.getMapper(ProposalItemMapper.class);

    @Mapping(target = "unitId", source = "unit.id")
    @Mapping(target = "unitName", source = "unit.name")
    @Mapping(target = "supplierProposalId", source = "supplierProposal.id")
    @Mapping(target = "tenderItemId", source = "tenderItem.id")
    ProposalItemDto toDto(ProposalItem entity);
    ProposalItem toEntity(ProposalItemDto dto);
} 