package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.OrgSupplierMaterialMapping;

import java.util.Optional;
import java.util.UUID;

public interface OrgSupplierMaterialMappingRepository extends JpaRepository<OrgSupplierMaterialMapping, UUID> {
    Optional<OrgSupplierMaterialMapping> findByOrganizationIdAndSupplierNameAndCharacteristicId(UUID organizationId, String supplierName, UUID characteristicId);
    
    Optional<OrgSupplierMaterialMapping> findByOrganizationIdAndSupplierNameAndMaterialId(UUID organizationId, String supplierName, UUID materialId);
} 