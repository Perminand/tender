package ru.perminov.tender.dto.company.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ContactPersonDto(
        UUID id,

        UUID companyId,

        String lastName,

        String firstName,

        String position,

        List<ContactDto> contacts
) {

}