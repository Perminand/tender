package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.WorkType;

import java.util.Optional;
import java.util.UUID;

public interface WorkTypeRepository extends JpaRepository<WorkType, UUID> {
    Optional<WorkType> findByName(String name);
} 