package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.ImportColumnMapping;

import java.util.Optional;

public interface ImportColumnMappingRepository extends JpaRepository<ImportColumnMapping, Long> {
    Optional<ImportColumnMapping> findByUserIdAndCompanyId(String userId, String companyId);
} 