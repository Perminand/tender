package ru.perminov.tender.dto.document;

import lombok.Data;
import java.util.UUID;

@Data
public class DocumentDtoNew {
    private String documentNumber;
    private String title;
    private String documentType;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String mimeType;
    private UUID relatedEntityId;
    private String relatedEntityType;
    private String version;
    private String description;
} 