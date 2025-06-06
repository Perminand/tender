package ru.perminov.tender.repository.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.company.ContactPerson;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContactPersonRepository extends JpaRepository<ContactPerson, UUID> {
    List<ContactPerson> findByCompanyUuid(UUID companyUuid);
} 