package ru.perminov.tender.dto.company.contact;

import java.util.UUID;

public record ContactDtoUpdate(
    UUID contactPersonId,
    UUID typeUuid,
    String newTypeName,
    String value
) {} 