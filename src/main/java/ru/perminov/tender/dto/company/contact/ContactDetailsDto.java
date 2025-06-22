package ru.perminov.tender.dto.company.contact;

public record ContactDetailsDto(
    String value,
    ContactTypeDetailsDto contactType
) {} 