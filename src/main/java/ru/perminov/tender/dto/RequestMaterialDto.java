package ru.perminov.tender.dto;

import ru.perminov.tender.dto.material.MaterialDto;
import ru.perminov.tender.dto.worktype.WorkTypeDto;
import java.util.UUID;

public record RequestMaterialDto(
    UUID id,

    Integer number,

    WorkTypeDto workType,

    MaterialDto material,

    String size,

    Double quantity,

    UnitDto unit,

    String note,

    String deliveryDate,

    String supplierMaterialName,

    Double estimatePrice,

    String materialLink
) {} 