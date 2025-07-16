package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.perminov.tender.dto.document.DocumentDto;
import ru.perminov.tender.dto.document.DocumentDtoNew;
import ru.perminov.tender.service.DocumentService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {
    private final DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<DocumentDto> uploadDocument(@RequestParam("file") MultipartFile file, 
                                                   @RequestParam("documentNumber") String documentNumber,
                                                   @RequestParam("title") String title,
                                                   @RequestParam("documentType") String documentType,
                                                   @RequestParam(value = "relatedEntityId", required = false) UUID relatedEntityId,
                                                   @RequestParam(value = "relatedEntityType", required = false) String relatedEntityType,
                                                   @RequestParam(value = "version", required = false) String version) {
        log.info("Загрузка документа: {}, тип: {}, размер: {}", title, documentType, file.getSize());
        
        DocumentDtoNew documentDtoNew = new DocumentDtoNew();
        documentDtoNew.setDocumentNumber(documentNumber);
        documentDtoNew.setTitle(title);
        documentDtoNew.setDocumentType(documentType);
        documentDtoNew.setRelatedEntityId(relatedEntityId);
        documentDtoNew.setRelatedEntityType(relatedEntityType);
        documentDtoNew.setVersion(version != null ? version : "1.0");
        
        return ResponseEntity.ok(documentService.uploadDocument(file, documentDtoNew));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getDocumentById(@PathVariable UUID id) {
        log.info("Получение документа по id: {}", id);
        DocumentDto dto = documentService.getDocumentById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getAllDocuments() {
        log.info("Получение всех документов");
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/type/{documentType}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByType(@PathVariable String documentType) {
        log.info("Получение документов по типу: {}", documentType);
        return ResponseEntity.ok(documentService.getDocumentsByType(documentType));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByEntity(@PathVariable String entityType, @PathVariable UUID entityId) {
        log.info("Получение документов по сущности: {} {}", entityType, entityId);
        return ResponseEntity.ok(documentService.getDocumentsByEntity(entityId, entityType));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentDto> updateDocument(@PathVariable UUID id, @RequestBody DocumentDtoNew documentDtoNew) {
        log.info("Обновление документа id {}: {}", id, documentDtoNew);
        DocumentDto dto = documentService.updateDocument(id, documentDtoNew);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id) {
        log.info("Удаление документа id {}", id);
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ByteArrayResource> downloadDocument(@PathVariable UUID id) {
        log.info("Скачивание документа id {}", id);
        byte[] data = documentService.downloadDocument(id);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        
        DocumentDto document = documentService.getDocumentById(id);
        ByteArrayResource resource = new ByteArrayResource(data);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(document.getMimeType()))
                .contentLength(data.length)
                .body(resource);
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<DocumentDto>> getDocumentVersions(@PathVariable UUID id) {
        log.info("Получение версий документа id {}", id);
        return ResponseEntity.ok(documentService.getDocumentVersions(id));
    }

    @PostMapping("/{id}/version")
    public ResponseEntity<DocumentDto> createNewVersion(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        log.info("Создание новой версии документа id {}", id);
        DocumentDto dto = documentService.createNewVersion(id, file);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/sign")
    public ResponseEntity<DocumentDto> signDocument(@PathVariable UUID id) {
        log.info("Подписание документа id {}", id);
        DocumentDto dto = documentService.signDocument(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @GetMapping("/status-stats")
    public ResponseEntity<Map<String, Long>> getStatusStats() {
        return ResponseEntity.ok(documentService.getStatusStats());
    }
} 