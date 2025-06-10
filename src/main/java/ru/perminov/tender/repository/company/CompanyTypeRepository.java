package ru.perminov.tender.repository.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.company.CompanyType;

import java.util.UUID;

@Repository
public interface CompanyTypeRepository extends JpaRepository<CompanyType, UUID> {
    boolean existsByName(String name);
}