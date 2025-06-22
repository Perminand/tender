package ru.perminov.tender.dto.company.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import ru.perminov.tender.model.company.Company;

import java.util.UUID;
import java.util.List;

public record ContactPersonDtoUpdate(
        String lastName,
        String firstName,
        String position,
        Company company,
    List<ContactDetailsDto> contacts
) {} 