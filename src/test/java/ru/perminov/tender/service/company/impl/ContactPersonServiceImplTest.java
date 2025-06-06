package ru.perminov.tender.service.company.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoNew;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoUpdate;
import ru.perminov.tender.mapper.company.ContactPersonMapper;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.company.Contact;
import ru.perminov.tender.model.company.ContactPerson;
import ru.perminov.tender.model.company.ContactType;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.repository.company.ContactPersonRepository;
import ru.perminov.tender.repository.company.ContactTypeRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactPersonServiceImplTest {

    @Mock
    private ContactPersonRepository contactPersonRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private ContactTypeRepository contactTypeRepository;
    @Mock
    private ContactPersonMapper contactPersonMapper;

    @InjectMocks
    private ContactPersonServiceImpl contactPersonService;

    private UUID companyUuid;
    private UUID contactPersonUuid;
    private Company company;
    private ContactPerson contactPerson;
    private ContactType phoneType;
    private ContactType emailType;
    private ContactPersonDtoNew contactPersonDtoNew;
    private ContactPersonDtoUpdate contactPersonDtoUpdate;

    @BeforeEach
    void setUp() {
        companyUuid = UUID.randomUUID();
        contactPersonUuid = UUID.randomUUID();

        company = new Company();
        company.setUuid(companyUuid);

        phoneType = new ContactType();
        phoneType.setCode("PHONE");
        phoneType.setName("Телефон");

        emailType = new ContactType();
        emailType.setCode("EMAIL");
        emailType.setName("Email");

        contactPerson = new ContactPerson();
        contactPerson.setUuid(contactPersonUuid);
        contactPerson.setCompany(company);
        contactPerson.setFirstName("Иван");
        contactPerson.setLastName("Иванов");
        contactPerson.setPosition("Менеджер");

        contactPersonDtoNew = new ContactPersonDtoNew(
                companyUuid,
                "Иванов",
                "Иван",
                "Менеджер",
                "+79001234567",
                "ivan@example.com"
        );

        contactPersonDtoUpdate = new ContactPersonDtoUpdate(
                "Петров",
                "Петр",
                "Директор",
                "+79001234567",
                "petr@example.com"
        );
    }

    @Test
    void create_ShouldCreateContactPersonWithContacts() {
        // Arrange
        when(companyRepository.findById(companyUuid)).thenReturn(Optional.of(company));
        when(contactTypeRepository.findByCode("PHONE")).thenReturn(Optional.of(phoneType));
        when(contactTypeRepository.findByCode("EMAIL")).thenReturn(Optional.of(emailType));
        when(contactPersonMapper.toContactPerson(any())).thenReturn(contactPerson);
        when(contactPersonRepository.save(any())).thenReturn(contactPerson);

        // Act
        ContactPerson result = contactPersonService.create(contactPersonDtoNew);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getContacts().size());
        verify(contactPersonRepository).save(any());
    }

    @Test
    void create_ShouldThrowException_WhenCompanyNotFound() {
        // Arrange
        when(companyRepository.findById(companyUuid)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> contactPersonService.create(contactPersonDtoNew));
    }

    @Test
    void update_ShouldUpdateContactPersonAndContacts() {
        // Arrange
        when(contactPersonRepository.findById(contactPersonUuid)).thenReturn(Optional.of(contactPerson));
        when(contactTypeRepository.findByCode("PHONE")).thenReturn(Optional.of(phoneType));
        when(contactTypeRepository.findByCode("EMAIL")).thenReturn(Optional.of(emailType));
        when(contactPersonRepository.save(any())).thenReturn(contactPerson);

        // Act
        ContactPerson result = contactPersonService.update(contactPersonUuid, contactPersonDtoUpdate);

        // Assert
        assertNotNull(result);
        verify(contactPersonMapper).updateContactPersonFromDto(any(), any());
        verify(contactPersonRepository).save(any());
    }

    @Test
    void update_ShouldThrowException_WhenContactPersonNotFound() {
        // Arrange
        when(contactPersonRepository.findById(contactPersonUuid)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> contactPersonService.update(contactPersonUuid, contactPersonDtoUpdate));
    }

    @Test
    void delete_ShouldDeleteContactPerson() {
        // Act
        contactPersonService.delete(contactPersonUuid);

        // Assert
        verify(contactPersonRepository).deleteById(contactPersonUuid);
    }

    @Test
    void getById_ShouldReturnContactPerson() {
        // Arrange
        when(contactPersonRepository.findById(contactPersonUuid)).thenReturn(Optional.of(contactPerson));

        // Act
        ContactPerson result = contactPersonService.getById(contactPersonUuid);

        // Assert
        assertNotNull(result);
        assertEquals(contactPersonUuid, result.getUuid());
    }

    @Test
    void getById_ShouldThrowException_WhenContactPersonNotFound() {
        // Arrange
        when(contactPersonRepository.findById(contactPersonUuid)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> contactPersonService.getById(contactPersonUuid));
    }

    @Test
    void getAll_ShouldReturnAllContactPersons() {
        // Arrange
        List<ContactPerson> contactPersons = List.of(contactPerson);
        when(contactPersonRepository.findAll()).thenReturn(contactPersons);

        // Act
        List<ContactPerson> result = contactPersonService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(contactPerson, result.get(0));
    }

    @Test
    void getByCompanyUuid_ShouldReturnContactPersonsForCompany() {
        // Arrange
        List<ContactPerson> contactPersons = List.of(contactPerson);
        when(contactPersonRepository.findByCompanyUuid(companyUuid)).thenReturn(contactPersons);

        // Act
        List<ContactPerson> result = contactPersonService.getByCompanyUuid(companyUuid);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(contactPerson, result.get(0));
    }
} 