package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.perminov.tender.dto.document.DocumentDto;
import ru.perminov.tender.dto.document.DocumentDtoNew;
import ru.perminov.tender.mapper.DocumentMapper;
import ru.perminov.tender.model.Document;
import ru.perminov.tender.repository.DocumentRepository;
import ru.perminov.tender.service.AuditLogService;
import ru.perminov.tender.service.DocumentService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentServiceImpl implements DocumentService {
    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private static final String UPLOAD_DIR = "uploads/documents/";
    private final AuditLogService auditLogService;

    @Override
    public DocumentDto uploadDocument(MultipartFile file, DocumentDtoNew documentDtoNew) {
        try {
            // Создаем директорию если не существует
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Генерируем уникальное имя файла
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            // Сохраняем файл
            Files.copy(file.getInputStream(), filePath);

            // Создаем документ в БД
            Document document = documentMapper.toEntity(documentDtoNew);
            document.setFileName(originalFilename);
            document.setFilePath(filePath.toString());
            document.setFileSize(file.getSize());
            
            // Определяем MIME-тип на основе расширения файла, если Content-Type не определен
            String mimeType = file.getContentType();
            if (mimeType == null || mimeType.isEmpty() || "application/octet-stream".equals(mimeType)) {
                mimeType = getMimeTypeFromFileName(originalFilename);
            }
            document.setMimeType(mimeType);
            document.setStatus(Document.DocumentStatus.ACTIVE);

            Document saved = documentRepository.save(document);
            DocumentDto savedDto = documentMapper.toDto(saved);
            auditLogService.logSimple(null, "CREATE_DOCUMENT", "Document", savedDto.getId().toString(), "Загружен документ");
            return savedDto;
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при сохранении файла", e);
        }
    }

    @Override
    public DocumentDto getDocumentById(UUID id) {
        return documentRepository.findById(id)
                .map(documentMapper::toDto)
                .orElse(null);
    }

    @Override
    public List<DocumentDto> getAllDocuments() {
        return documentMapper.toDtoList(documentRepository.findAll());
    }

    @Override
    public List<DocumentDto> getDocumentsByType(String documentType) {
        try {
            Document.DocumentType type = Document.DocumentType.valueOf(documentType.toUpperCase());
            return documentMapper.toDtoList(documentRepository.findByType(type));
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    @Override
    public List<DocumentDto> getDocumentsByEntity(UUID entityId, String entityType) {
        return documentMapper.toDtoList(documentRepository.findByRelatedEntityIdAndRelatedEntityType(entityId, entityType));
    }

    @Override
    public DocumentDto updateDocument(UUID id, DocumentDtoNew documentDtoNew) {
        Optional<Document> documentOpt = documentRepository.findById(id);
        if (documentOpt.isEmpty()) return null;
        Document document = documentOpt.get();
        documentMapper.updateEntity(document, documentDtoNew);
        DocumentDto updated = documentMapper.toDto(documentRepository.save(document));
        auditLogService.logSimple(null, "UPDATE_DOCUMENT", "Document", updated.getId().toString(), "Обновлен документ");
        return updated;
    }

    @Override
    public void deleteDocument(UUID id) {
        Optional<Document> documentOpt = documentRepository.findById(id);
        if (documentOpt.isPresent()) {
            Document document = documentOpt.get();
            // Удаляем файл с диска
            try {
                Path filePath = Paths.get(document.getFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Логируем ошибку, но не прерываем удаление записи из БД
            }
            documentRepository.deleteById(id);
            auditLogService.logSimple(null, "DELETE_DOCUMENT", "Document", id.toString(), "Удален документ");
        }
    }

    @Override
    public byte[] downloadDocument(UUID id) {
        Optional<Document> documentOpt = documentRepository.findById(id);
        if (documentOpt.isEmpty()) return null;
        
        Document document = documentOpt.get();
        try {
            Path filePath = Paths.get(document.getFilePath());
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при чтении файла", e);
        }
    }

    @Override
    public List<DocumentDto> getDocumentVersions(UUID documentId) {
        // TODO: реализовать получение версий документа
        return List.of();
    }

    @Override
    public DocumentDto createNewVersion(UUID documentId, MultipartFile file) {
        // TODO: реализовать создание новой версии документа
        return null;
    }

    @Override
    public DocumentDto signDocument(UUID id) {
        Optional<Document> documentOpt = documentRepository.findById(id);
        if (documentOpt.isEmpty()) return null;
        Document document = documentOpt.get();
        document.setStatus(Document.DocumentStatus.ACTIVE);
        return documentMapper.toDto(documentRepository.save(document));
    }

    @Override
    public Map<String, Long> getStatusStats() {
        Map<String, Long> stats = new java.util.LinkedHashMap<>();
        for (Document.DocumentStatus status : Document.DocumentStatus.values()) {
            stats.put(status.name(), documentRepository.countByStatus(status));
        }
        return stats;
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
} 