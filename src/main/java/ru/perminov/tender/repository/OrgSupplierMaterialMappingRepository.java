package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.OrgSupplierMaterialMapping;

import java.util.Optional;
import java.util.UUID;

public interface OrgSupplierMaterialMappingRepository extends JpaRepository<OrgSupplierMaterialMapping, UUID> {
    Optional<OrgSupplierMaterialMapping> findByOrganizationIdAndSupplierName(UUID organizationId, String supplierName);
} 