package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.TypeCompany;

import java.util.UUID;

@Repository
public interface TypeCompanyRepository extends JpaRepository<TypeCompany, UUID> {
    boolean existsByName(String name);
} 