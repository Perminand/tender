package ru.perminov.tender.dto.material;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;

import java.util.Set;
import java.util.UUID;

public record MaterialDtoNew(

        @NotBlank(message = "Название материала не может быть пустым")
        String name,

        String description,

        UUID materialTypeId,

        @URL(message = "Некорректная ссылка")
        String link,

        Set<UUID> unitIds,

        @NotBlank(message = "Код материала не может быть пустым")
        String code,

        UUID categoryId

) {
} 