package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "work_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class WorkType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WorkType workType = (WorkType) o;
        return id != null && id.equals(workType.id);
    }

    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }
} 