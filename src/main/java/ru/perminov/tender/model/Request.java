package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.model.Unit;
import ru.perminov.tender.model.RequestMaterial;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "requests")
@Getter
@Setter
@ToString
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

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequestMaterial> materials = new ArrayList<>();
} 