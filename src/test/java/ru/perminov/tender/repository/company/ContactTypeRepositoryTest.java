package ru.perminov.tender.repository.company;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import ru.perminov.tender.model.company.ContactType;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class ContactTypeRepositoryTest {

    @Autowired
    private ContactTypeRepository contactTypeRepository;

    @Test
    void findByCode_ShouldReturnContactType_WhenExists() {
        // Arrange
        ContactType phoneType = new ContactType();
        phoneType.setCode("PHONE");
        phoneType.setName("Телефон");
        contactTypeRepository.save(phoneType);

        // Act
        Optional<ContactType> result = contactTypeRepository.findByCode("PHONE");

        // Assert
        assertTrue(result.isPresent());
        assertEquals("PHONE", result.get().getCode());
        assertEquals("Телефон", result.get().getName());
    }

    @Test
    void findByCode_ShouldReturnEmpty_WhenNotExists() {
        // Act
        Optional<ContactType> result = contactTypeRepository.findByCode("NONEXISTENT");

        // Assert
        assertTrue(result.isEmpty());
    }
} 