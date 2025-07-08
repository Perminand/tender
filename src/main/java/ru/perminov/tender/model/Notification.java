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
@Table(name = "notifications")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String recipientEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_company_id")
    private Company recipientCompany;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tender_id")
    private Tender tender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_proposal_id")
    private SupplierProposal supplierProposal;

    @Enumerated(EnumType.STRING)
    private NotificationStatus status = NotificationStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime sentAt;

    private String errorMessage;

    public enum NotificationType {
        TENDER_PUBLISHED("Опубликован новый тендер"),
        TENDER_REMINDER("Напоминание о дедлайне тендера"),
        PROPOSAL_SUBMITTED("Получено новое предложение"),
        TENDER_AWARDED("Тендер присужден"),
        TENDER_CANCELLED("Тендер отменен"),
        DEADLINE_APPROACHING("Приближается дедлайн подачи предложений"),
        SUPPLIER_INVITATION("Приглашение к участию в тендере");

        private final String description;

        NotificationType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum NotificationStatus {
        PENDING("Ожидает отправки"),
        SENT("Отправлено"),
        FAILED("Ошибка отправки"),
        CANCELLED("Отменено");

        private final String description;

        NotificationStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Notification that = (Notification) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }
} 