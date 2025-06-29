package ru.perminov.tender.dto;

import java.util.UUID;

public record OrgSupplierMaterialMappingDto(
    UUID id,
    UUID organizationId,
    String organizationName,
    String supplierName,
    UUID materialId,
    String materialName
) {} 