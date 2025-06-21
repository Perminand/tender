package ru.perminov.tender.repository.company;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.company.ContactType;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactTypeRepository extends JpaRepository<ContactType, UUID> {
    Optional<ContactType> findByName(String name);

    boolean existsByName(@NotBlank(message = "Название типа контакта не может быть пустым") String name);
}