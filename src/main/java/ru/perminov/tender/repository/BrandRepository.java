package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Brand;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {
    
    Optional<Brand> findByName(String name);
    
    @Query("SELECT b FROM Brand b WHERE LOWER(b.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY b.name")
    List<Brand> findByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    boolean existsByName(String name);
} 