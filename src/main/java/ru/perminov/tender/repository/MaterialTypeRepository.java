package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.MaterialType;

import java.util.UUID;
import java.util.Optional;

@Repository
public interface MaterialTypeRepository extends JpaRepository<MaterialType, UUID> {

    boolean existsByName(String name);
    
    Optional<MaterialType> findByName(String name);
} 