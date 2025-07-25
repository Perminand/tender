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
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {
    private final DocumentService documentService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
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

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getDocumentById(@PathVariable UUID id) {
        log.info("Получение документа по id: {}", id);
        DocumentDto dto = documentService.getDocumentById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping
    public ResponseEntity<List<DocumentDto>> getAllDocuments() {
        log.info("Получение всех документов");
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/type/{documentType}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByType(@PathVariable String documentType) {
        log.info("Получение документов по типу: {}", documentType);
        return ResponseEntity.ok(documentService.getDocumentsByType(documentType));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByEntity(@PathVariable String entityType, @PathVariable UUID entityId) {
        log.info("Получение документов по сущности: {} {}", entityType, entityId);
        return ResponseEntity.ok(documentService.getDocumentsByEntity(entityId, entityType));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @PutMapping("/{id}")
    public ResponseEntity<DocumentDto> updateDocument(@PathVariable UUID id, @RequestBody DocumentDtoNew documentDtoNew) {
        log.info("Обновление документа id {}: {}", id, documentDtoNew);
        DocumentDto dto = documentService.updateDocument(id, documentDtoNew);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id) {
        log.info("Удаление документа id {}", id);
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}/download")
    public ResponseEntity<ByteArrayResource> downloadDocument(@PathVariable UUID id) {
        log.info("Скачивание документа id {}", id);
        byte[] data = documentService.downloadDocument(id);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        
        DocumentDto document = documentService.getDocumentById(id);
        ByteArrayResource resource = new ByteArrayResource(data);
        
        // Определяем правильный MIME-тип на основе расширения файла
        String mimeType = getMimeTypeFromFileName(document.getFileName());
        if (document.getMimeType() != null && !document.getMimeType().isEmpty()) {
            mimeType = document.getMimeType();
        }
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(mimeType))
                .contentLength(data.length)
                .body(resource);
    }
    
    /**
     * Определяет MIME-тип на основе расширения файла
     */
    private String getMimeTypeFromFileName(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return "application/octet-stream";
        }
        
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "ppt" -> "application/vnd.ms-powerpoint";
            case "pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "txt" -> "text/plain";
            case "rtf" -> "application/rtf";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "bmp" -> "image/bmp";
            case "tiff" -> "image/tiff";
            case "zip" -> "application/zip";
            case "rar" -> "application/x-rar-compressed";
            case "7z" -> "application/x-7z-compressed";
            case "xml" -> "application/xml";
            case "json" -> "application/json";
            case "csv" -> "text/csv";
            default -> "application/octet-stream";
        };
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}/versions")
    public ResponseEntity<List<DocumentDto>> getDocumentVersions(@PathVariable UUID id) {
        log.info("Получение версий документа id {}", id);
        return ResponseEntity.ok(documentService.getDocumentVersions(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @PostMapping("/{id}/version")
    public ResponseEntity<DocumentDto> createNewVersion(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        log.info("Создание новой версии документа id {}", id);
        DocumentDto dto = documentService.createNewVersion(id, file);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @PostMapping("/{id}/sign")
    public ResponseEntity<DocumentDto> signDocument(@PathVariable UUID id) {
        log.info("Подписание документа id {}", id);
        DocumentDto dto = documentService.signDocument(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping("/status-stats")
    public ResponseEntity<Map<String, Long>> getStatusStats() {
        return ResponseEntity.ok(documentService.getStatusStats());
    }
} 