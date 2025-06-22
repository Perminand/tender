package ru.perminov.tender.dto.material;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

public record MaterialDtoNew(

    @NotBlank(message = "Название не может быть пустым")
    String name,

    String description,

    UUID materialTypeId,

    String link,

    List<UUID> unitIds,

    String code,

    UUID categoryId

) {} 