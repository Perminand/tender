package ru.perminov.tender.service;

import ru.perminov.tender.dto.document.DocumentDto;
import ru.perminov.tender.dto.document.DocumentDtoNew;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.Map;

public interface DocumentService {
    
    /**
     * Загрузить документ
     */
    DocumentDto uploadDocument(MultipartFile file, DocumentDtoNew documentDtoNew);
    
    /**
     * Получить документ по ID
     */
    DocumentDto getDocumentById(UUID id);
    
    /**
     * Получить все документы
     */
    List<DocumentDto> getAllDocuments();
    
    /**
     * Получить документы по типу
     */
    List<DocumentDto> getDocumentsByType(String documentType);
    
    /**
     * Получить документы по связанной сущности
     */
    List<DocumentDto> getDocumentsByEntity(UUID entityId, String entityType);
    
    /**
     * Обновить документ
     */
    DocumentDto updateDocument(UUID id, DocumentDtoNew documentDtoNew);
    
    /**
     * Удалить документ
     */
    void deleteDocument(UUID id);
    
    /**
     * Скачать документ
     */
    byte[] downloadDocument(UUID id);
    
    /**
     * Получить версии документа
     */
    List<DocumentDto> getDocumentVersions(UUID documentId);
    
    /**
     * Создать новую версию документа
     */
    DocumentDto createNewVersion(UUID documentId, MultipartFile file);
    
    /**
     * Подписать документ
     */
    DocumentDto signDocument(UUID id);

    /**
     * Получить статистику по статусам документов
     */
    Map<String, Long> getStatusStats();
} 