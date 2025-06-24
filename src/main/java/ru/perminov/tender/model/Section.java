package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "sections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Section section = (Section) o;
        return id != null && id.equals(section.id);
    }

    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }
} 