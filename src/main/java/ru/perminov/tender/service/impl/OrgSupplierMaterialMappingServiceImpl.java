package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.OrgSupplierMaterialMappingDto;
import ru.perminov.tender.mapper.OrgSupplierMaterialMappingMapper;
import ru.perminov.tender.model.Characteristic;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.model.OrgSupplierMaterialMapping;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.CharacteristicRepository;
import ru.perminov.tender.repository.MaterialRepository;
import ru.perminov.tender.repository.OrgSupplierMaterialMappingRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.service.OrgSupplierMaterialMappingService;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrgSupplierMaterialMappingServiceImpl implements OrgSupplierMaterialMappingService {
    private final OrgSupplierMaterialMappingRepository orgSupplierMaterialMappingRepository;
    private final CompanyRepository companyRepository;
    private final MaterialRepository materialRepository;
    private final CharacteristicRepository characteristicRepository;
    private final OrgSupplierMaterialMappingMapper mapper;


    @Override
    public Optional<OrgSupplierMaterialMappingDto> find(UUID organizationId, String supplierName, UUID characteristicId) {
        Optional<OrgSupplierMaterialMapping> orgSupplierMaterialMapping = orgSupplierMaterialMappingRepository.findByOrganizationIdAndSupplierNameAndCharacteristicId(organizationId, supplierName, characteristicId);
        return orgSupplierMaterialMapping.map(mapper::toDto);
    }

    @Override
    public OrgSupplierMaterialMappingDto save(
            UUID organizationId,
            String supplierName,
            UUID materialId,
            UUID characteristicId
    ) {
        Company org = companyRepository.findById(organizationId).orElseThrow();
        Material mat = materialRepository.findById(materialId).orElseThrow();
        
        OrgSupplierMaterialMapping mapping;
        if (characteristicId != null) {
            Characteristic cha = characteristicRepository.findById(characteristicId).orElseThrow();
            mapping = orgSupplierMaterialMappingRepository.findByOrganizationIdAndSupplierNameAndCharacteristicId(organizationId, supplierName, characteristicId)
                    .orElse(new OrgSupplierMaterialMapping());
            mapping.setCharacteristic(cha);
        } else {
            mapping = orgSupplierMaterialMappingRepository.findByOrganizationIdAndSupplierNameAndMaterialId(organizationId, supplierName, materialId)
                    .orElse(new OrgSupplierMaterialMapping());
            mapping.setCharacteristic(null);
        }
        
        mapping.setOrganization(org);
        mapping.setSupplierName(supplierName);
        mapping.setMaterial(mat);
        orgSupplierMaterialMappingRepository.save(mapping);
        return mapper.toDto(mapping);
    }
} 