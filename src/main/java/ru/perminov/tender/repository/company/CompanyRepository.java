package ru.perminov.tender.repository.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.company.CompanyRole;

import java.util.UUID;
import java.util.Optional;
import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {

    Optional<Company> findByInn(String inn);

    Optional<Company> findByShortName(String shortName);

    List<Company> findByRole(CompanyRole role);

    Optional<Company> findByEmail(String email);
    
    long countByRole(CompanyRole role);
} 