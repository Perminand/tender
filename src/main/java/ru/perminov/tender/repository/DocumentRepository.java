package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Document;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    
    /**
     * Найти документы по типу
     */
    List<Document> findByType(Document.DocumentType type);
    
    /**
     * Найти документы по связанной сущности
     */
    List<Document> findByRelatedEntityIdAndRelatedEntityType(UUID entityId, String entityType);
    
    /**
     * Найти документ по номеру
     */
    Document findByDocumentNumber(String documentNumber);
    
    /**
     * Найти документы по статусу
     */
    List<Document> findByStatus(Document.DocumentStatus status);
    
    /**
     * Найти документы по версии
     */
    List<Document> findByVersion(String version);
    
    /**
     * Найти подписанные документы
     */
    @Query("SELECT d FROM Document d WHERE d.status = 'ACTIVE'")
    List<Document> findSignedDocuments();
    
    /**
     * Найти документы для подписания
     */
    @Query("SELECT d FROM Document d WHERE d.status = 'ACTIVE'")
    List<Document> findDocumentsForSigning();
    
    /**
     * Найти последние версии документов
     */
    @Query("SELECT d FROM Document d WHERE d.relatedEntityId = :entityId AND d.relatedEntityType = :entityType ORDER BY d.version DESC")
    List<Document> findLatestVersionsByEntity(@Param("entityId") UUID entityId, @Param("entityType") String entityType);
} 