package ru.perminov.tender.dto.material;

import java.util.UUID;

public record MaterialDtoUpdate(

    String name,

    String description,

    String type,

    String link,

    String unit,

    String code,

    UUID categoryId

) {} 