package ru.perminov.tender.service;

import ru.perminov.tender.model.OrgSupplierMaterialMapping;
import java.util.Optional;
import java.util.UUID;
 
public interface OrgSupplierMaterialMappingService {
    Optional<OrgSupplierMaterialMapping> find(UUID organizationId, String supplierName);
    OrgSupplierMaterialMapping save(UUID organizationId, String supplierName, UUID materialId);
} 