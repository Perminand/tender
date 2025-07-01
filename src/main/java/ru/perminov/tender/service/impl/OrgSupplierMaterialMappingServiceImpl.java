package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.model.OrgSupplierMaterialMapping;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.MaterialRepository;
import ru.perminov.tender.repository.OrgSupplierMaterialMappingRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.service.OrgSupplierMaterialMappingService;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrgSupplierMaterialMappingServiceImpl implements OrgSupplierMaterialMappingService {
    private final OrgSupplierMaterialMappingRepository repository;
    private final CompanyRepository companyRepository;
    private final MaterialRepository materialRepository;

    @Override
    public Optional<OrgSupplierMaterialMapping> find(UUID organizationId, String supplierName) {
        Optional<OrgSupplierMaterialMapping> orgSupplierMaterialMapping = repository.findByOrganizationIdAndSupplierName(organizationId, supplierName);
        return orgSupplierMaterialMapping;
    }

    @Override
    public OrgSupplierMaterialMapping save(UUID organizationId, String supplierName, UUID materialId) {
        Company org = companyRepository.findById(organizationId).orElseThrow();
        Material mat = materialRepository.findById(materialId).orElseThrow();
        OrgSupplierMaterialMapping mapping = repository.findByOrganizationIdAndSupplierName(organizationId, supplierName)
                .orElse(new OrgSupplierMaterialMapping());
        mapping.setOrganization(org);
        mapping.setSupplierName(supplierName);
        mapping.setMaterial(mat);
        return repository.save(mapping);
    }
} 