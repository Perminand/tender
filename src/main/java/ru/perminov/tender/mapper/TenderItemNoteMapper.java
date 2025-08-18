package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import ru.perminov.tender.dto.tender.TenderItemNoteDto;
import ru.perminov.tender.model.TenderItemNote;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TenderItemNoteMapper {

    @Mapping(source = "tenderItem.id", target = "tenderItemId")
    @Mapping(source = "supplier.id", target = "supplierId")
    TenderItemNoteDto toDto(TenderItemNote entity);
}


