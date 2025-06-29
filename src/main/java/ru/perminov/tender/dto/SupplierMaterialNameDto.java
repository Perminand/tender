package ru.perminov.tender.dto;

import java.util.UUID;

public record SupplierMaterialNameDto(
    UUID id,
    String name,
    UUID materialId,
    String materialName,
    UUID supplierId,
    String supplierName
) {} 