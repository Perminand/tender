package ru.perminov.tender.repository.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.company.TypeCompany;

import java.util.UUID;

@Repository
public interface TypeCompanyRepository extends JpaRepository<TypeCompany, UUID> {
    boolean existsByName(String name);
} 