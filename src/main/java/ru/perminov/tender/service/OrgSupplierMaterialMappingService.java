package ru.perminov.tender.service;

import ru.perminov.tender.dto.OrgSupplierMaterialMappingDto;

import java.util.Optional;
import java.util.UUID;
 
public interface OrgSupplierMaterialMappingService {

    Optional<OrgSupplierMaterialMappingDto> find(UUID organizationId, String supplierName, UUID characteristicId);

    OrgSupplierMaterialMappingDto save(UUID organizationId, String supplierName, UUID materialId, UUID characteristicId);
} 