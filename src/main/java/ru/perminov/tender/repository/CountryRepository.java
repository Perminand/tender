package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Country;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CountryRepository extends JpaRepository<Country, UUID> {
    
    Optional<Country> findByName(String name);
    
    @Query("SELECT c FROM Country c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY c.name")
    List<Country> findByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    boolean existsByName(String name);
} 