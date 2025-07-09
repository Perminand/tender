package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.document.DocumentDto;
import ru.perminov.tender.dto.document.DocumentDtoNew;
import ru.perminov.tender.model.Document;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DocumentMapper {
    
    /**
     * Преобразовать модель в DTO
     */
    @Mapping(target = "documentType", source = "type")
    DocumentDto toDto(Document document);
    
    /**
     * Преобразовать список моделей в список DTO
     */
    List<DocumentDto> toDtoList(List<Document> documents);
    
    /**
     * Преобразовать DTO для создания в модель
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "uploadedAt", ignore = true)
    @Mapping(target = "tender", ignore = true)
    @Mapping(target = "supplierProposal", ignore = true)
    @Mapping(target = "request", ignore = true)
    @Mapping(target = "uploadedBy", ignore = true)
    @Mapping(target = "type", source = "documentType")
    Document toEntity(DocumentDtoNew documentDtoNew);
    
    /**
     * Обновить модель из DTO для создания
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "uploadedAt", ignore = true)
    @Mapping(target = "tender", ignore = true)
    @Mapping(target = "supplierProposal", ignore = true)
    @Mapping(target = "request", ignore = true)
    @Mapping(target = "uploadedBy", ignore = true)
    @Mapping(target = "type", source = "documentType")
    void updateEntity(@MappingTarget Document document, DocumentDtoNew documentDtoNew);
} 