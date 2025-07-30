package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Warranty;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, UUID> {
    
    Optional<Warranty> findByName(String name);
    
    @Query("SELECT w FROM Warranty w WHERE LOWER(w.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY w.name")
    List<Warranty> findByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    boolean existsByName(String name);
} 