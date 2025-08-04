package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.InvoiceDto;
import ru.perminov.tender.dto.InvoiceDtoNew;
import ru.perminov.tender.dto.InvoiceDtoUpdate;
import ru.perminov.tender.dto.InvoiceItemDto;
import ru.perminov.tender.dto.InvoiceItemDtoNew;
import ru.perminov.tender.dto.InvoiceItemDtoUpdate;
import ru.perminov.tender.model.Invoice;
import ru.perminov.tender.model.InvoiceItem;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "paidAmount", constant = "0")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "invoiceItems", ignore = true)
    Invoice toEntity(InvoiceDtoNew dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contract", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "request", ignore = true)
    @Mapping(target = "invoiceItems", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Invoice invoice, InvoiceDtoUpdate dto);
    
    InvoiceDto toDto(Invoice entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "invoice", ignore = true)
    @Mapping(target = "material", ignore = true)
    @Mapping(target = "unit", ignore = true)
    @Mapping(target = "totalPrice", ignore = true)
    @Mapping(target = "vatAmount", ignore = true)
    InvoiceItem toEntity(InvoiceItemDtoNew dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "invoice", ignore = true)
    @Mapping(target = "material", ignore = true)
    @Mapping(target = "unit", ignore = true)
    @Mapping(target = "totalPrice", ignore = true)
    @Mapping(target = "vatAmount", ignore = true)
    void updateEntity(@MappingTarget InvoiceItem item, InvoiceItemDtoUpdate dto);
    
    InvoiceItemDto toDto(InvoiceItem entity);
} 