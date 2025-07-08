package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.perminov.tender.dto.NotificationDto;
import ru.perminov.tender.model.Notification;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    
    @Mapping(target = "tenderId", source = "tender.id")
    @Mapping(target = "tenderNumber", source = "tender.tenderNumber")
    @Mapping(target = "tenderTitle", source = "tender.title")
    @Mapping(target = "supplierProposalId", source = "supplierProposal.id")
    @Mapping(target = "supplierName", source = "supplierProposal.supplier.name")
    NotificationDto toDto(Notification entity);
    
    Notification toEntity(NotificationDto dto);
} 