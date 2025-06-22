package ru.perminov.tender.dto.material;

import java.util.List;
import java.util.UUID;

public record MaterialDtoUpdate(

    String name,

    String description,

    UUID materialTypeId,

    String link,

    List<UUID> unitIds,

    String code,

    UUID categoryId

) {} 