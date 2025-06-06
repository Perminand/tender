package ru.perminov.tender.mapper.company;

import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoNew;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoUpdate;
import ru.perminov.tender.model.company.ContactPerson;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ContactPersonMapperTest {

    private final ContactPersonMapper mapper = Mappers.getMapper(ContactPersonMapper.class);

    @Test
    void toContactPerson_ShouldMapDtoToEntity() {
        // Arrange
        UUID companyUuid = UUID.randomUUID();
        ContactPersonDtoNew dto = new ContactPersonDtoNew(
                companyUuid,
                "Иванов",
                "Иван",
                null,
                "Менеджер",
                "+79001234567",
                "ivan@example.com"
        );

        // Act
        ContactPerson result = mapper.toContactPerson(dto);

        // Assert
        assertNotNull(result);
        assertEquals("Иванов", result.getLastName());
        assertEquals("Иван", result.getFirstName());
        assertEquals("Менеджер", result.getPosition());
        assertNull(result.getCompany());
        assertTrue(result.getContacts().isEmpty());
    }

    @Test
    void updateContactPersonFromDto_ShouldUpdateEntity() {
        // Arrange
        ContactPerson contactPerson = new ContactPerson();
        contactPerson.setUuid(UUID.randomUUID());
        contactPerson.setLastName("Иванов");
        contactPerson.setFirstName("Иван");
        contactPerson.setPosition("Менеджер");

        ContactPersonDtoUpdate dto = new ContactPersonDtoUpdate(
                "Петров",
                "Петр",
                null,
                "Директор",
                "+79001234567",
                "petr@example.com"
        );

        // Act
        mapper.updateContactPersonFromDto(dto, contactPerson);

        // Assert
        assertEquals("Петров", contactPerson.getLastName());
        assertEquals("Петр", contactPerson.getFirstName());
        assertEquals("Директор", contactPerson.getPosition());
    }
} 