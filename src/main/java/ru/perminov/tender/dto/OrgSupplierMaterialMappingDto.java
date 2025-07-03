package ru.perminov.tender.dto;

import ru.perminov.tender.model.Characteristic;

import java.util.UUID;

public record OrgSupplierMaterialMappingDto(

    UUID id,

    UUID organizationId,

    String organizationName,

    String supplierName,

    UUID materialId,

    String materialName,

    CharacteristicDto characteristic
) {} 