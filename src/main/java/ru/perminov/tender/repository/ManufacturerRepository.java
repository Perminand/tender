package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Manufacturer;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ManufacturerRepository extends JpaRepository<Manufacturer, UUID> {
    
    Optional<Manufacturer> findByName(String name);
    
    @Query("SELECT m FROM Manufacturer m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY m.name")
    List<Manufacturer> findByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    boolean existsByName(String name);
} 