package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import ru.perminov.tender.model.company.Company;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "requests")
@Getter
@Setter
@ToString(exclude = "requestMaterials")
@NoArgsConstructor
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    private LocalDate date;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequestMaterial> requestMaterials = new ArrayList<>();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tender> tenders = new ArrayList<>();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Invoice> invoices = new ArrayList<>();

    private String requestNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    private String applicant;
    
    private String executor;
    
    private String approver;
    
    private String performer;
    
    private LocalDate deliveryDeadline;
    
    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.DRAFT;

    private String location;

    private String notes;

    public enum RequestStatus {
        DRAFT,           // Черновик
        SAVED,           // Сохранено
        SUBMITTED,       // Подана
        APPROVED,        // Одобрена
        IN_PROGRESS,     // В работе
        COMPLETED,       // Завершена
        CANCELLED        // Отменена
    }
}