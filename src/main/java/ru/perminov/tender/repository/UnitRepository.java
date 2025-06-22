package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Unit;

import java.util.UUID;

@Repository
public interface UnitRepository extends JpaRepository<Unit, UUID> {

    boolean existsByName(String name);
    
} 