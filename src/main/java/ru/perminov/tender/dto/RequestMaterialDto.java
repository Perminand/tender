package ru.perminov.tender.dto;

import jakarta.validation.constraints.Positive;
import ru.perminov.tender.dto.material.MaterialDto;
import ru.perminov.tender.dto.worktype.WorkTypeDto;
import java.util.UUID;

public record RequestMaterialDto(
    UUID id,

    Integer number,

    WorkTypeDto workType,

    MaterialDto material,

    String size,

    @Positive(message = "Количество должно быть больше 0")
    Double quantity,

    UnitDto unit,

    String note,

    String deliveryDate,

    String supplierMaterialName,

    @Positive(message = "Сметная цена должна быть больше 0")
    Double estimatePrice,

    String materialLink
) {} 