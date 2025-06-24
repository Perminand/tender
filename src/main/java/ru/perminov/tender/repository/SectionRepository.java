package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.Section;

import java.util.List;
import java.util.UUID;

public interface SectionRepository extends JpaRepository<Section, UUID> {
    List<Section> findByProjectId(UUID projectId);
} 