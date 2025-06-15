package ru.perminov.tender.dto.company.contact;

import java.util.UUID;

public record ContactDtoUpdate(
    UUID uuid,
    UUID typeUuid,
    String typeName,
    String value
) {} 