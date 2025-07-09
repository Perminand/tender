package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import ru.perminov.tender.model.company.Company;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String documentNumber;

    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tender_id")
    private Tender tender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_proposal_id")
    private SupplierProposal supplierProposal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private Request request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private Company uploadedBy;

    private String fileName;

    private String originalFileName;

    private String filePath;

    private Long fileSize;

    private String mimeType;

    @Enumerated(EnumType.STRING)
    private DocumentType type;

    @Enumerated(EnumType.STRING)
    private DocumentStatus status = DocumentStatus.ACTIVE;

    private LocalDateTime uploadedAt = LocalDateTime.now();

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    private String description;

    private String version;

    // Поля для связи с другими сущностями
    private UUID relatedEntityId;
    private String relatedEntityType;

    public enum DocumentType {
        TENDER_DOCUMENTATION,    // Документация тендера
        TECHNICAL_SPECIFICATION, // Техническое задание
        COMMERCIAL_OFFER,       // Коммерческое предложение
        CONTRACT,               // Договор
        INVOICE,                // Счет
        DELIVERY_NOTE,          // Накладная
        QUALITY_CERTIFICATE,    // Сертификат качества
        OTHER                   // Прочее
    }

    public enum DocumentStatus {
        ACTIVE,     // Активный
        ARCHIVED,   // Архивирован
        DELETED     // Удален
    }
} 